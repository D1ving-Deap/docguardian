import { supabase } from "@/integrations/supabase/client";
import { DocumentType } from './types/ocrTypes';
import { categorizeDocument, validateExtractedFields } from './documentCategorization';

export interface ApplicationStage {
  id: string;
  name: string;
  order: number;
  requiredDocuments: DocumentType[];
  automationRules: AutomationRule[];
}

export interface AutomationRule {
  condition: string;
  action: 'advance_stage' | 'flag_review' | 'request_documents' | 'notify_agent';
  parameters?: Record<string, any>;
}

export interface WorkflowStatus {
  currentStage: string;
  progress: number;
  blockers: string[];
  nextActions: string[];
  estimatedCompletion: string;
}

// Define mortgage application stages
export const MORTGAGE_STAGES: ApplicationStage[] = [
  {
    id: 'document_collection',
    name: 'Document Collection',
    order: 1,
    requiredDocuments: ['identification', 'income_proof'],
    automationRules: [
      {
        condition: 'all_required_documents_uploaded',
        action: 'advance_stage'
      }
    ]
  },
  {
    id: 'income_verification',
    name: 'Income Verification',
    order: 2,
    requiredDocuments: ['income_proof', 'bank_statement', 'tax_document'],
    automationRules: [
      {
        condition: 'income_variance_high',
        action: 'flag_review',
        parameters: { threshold: 20 }
      },
      {
        condition: 'income_verified',
        action: 'advance_stage'
      }
    ]
  },
  {
    id: 'asset_verification',
    name: 'Asset Verification',
    order: 3,
    requiredDocuments: ['bank_statement'],
    automationRules: [
      {
        condition: 'insufficient_assets',
        action: 'flag_review'
      },
      {
        condition: 'assets_verified',
        action: 'advance_stage'
      }
    ]
  },
  {
    id: 'property_appraisal',
    name: 'Property Appraisal',
    order: 4,
    requiredDocuments: [],
    automationRules: [
      {
        condition: 'appraisal_complete',
        action: 'advance_stage'
      }
    ]
  },
  {
    id: 'final_underwriting',
    name: 'Final Underwriting',
    order: 5,
    requiredDocuments: [],
    automationRules: [
      {
        condition: 'all_conditions_met',
        action: 'advance_stage'
      }
    ]
  },
  {
    id: 'approval',
    name: 'Approval',
    order: 6,
    requiredDocuments: [],
    automationRules: []
  }
];

/**
 * Process a newly uploaded document and trigger workflow automation
 */
export const processDocumentWorkflow = async (
  documentId: string,
  applicationId: string,
  extractedText: string,
  extractedFields: Record<string, any>,
  filename?: string
): Promise<{
  success: boolean;
  actions: string[];
  newStage?: string;
  issues?: string[];
}> => {
  try {
    const actions: string[] = [];
    const issues: string[] = [];

    // Step 1: Auto-categorize document
    const categorization = categorizeDocument(extractedText, filename);
    actions.push(`Document auto-categorized as: ${categorization.type} (${Math.round(categorization.confidence * 100)}% confidence)`);

    // Step 2: Update document with categorization
    await supabase
      .from('documents')
      .update({
        document_type: categorization.type,
        structured_data: {
          ...extractedFields,
          categorization: categorization
        }
      })
      .eq('id', documentId);

    // Step 3: Validate extracted fields
    const validation = validateExtractedFields(extractedFields, categorization.type);
    if (!validation.isComplete) {
      issues.push(`Missing required fields: ${validation.missingFields.join(', ')}`);
      actions.push(`Document completion: ${validation.completionPercentage}%`);
    }

    // Step 4: Get current application status
    const { data: applicationData } = await supabase
      .from('mortgage_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (!applicationData) {
      throw new Error('Application not found');
    }

    // Step 5: Evaluate workflow rules
    const currentStage = MORTGAGE_STAGES.find(s => s.id === applicationData.stage);
    if (currentStage) {
      const stageDocuments = await getStageDocuments(applicationId, currentStage.id);
      
      for (const rule of currentStage.automationRules) {
        const shouldExecute = await evaluateRule(rule, {
          stage: currentStage,
          documents: stageDocuments,
          application: applicationData,
          newDocument: {
            type: categorization.type,
            fields: extractedFields,
            validation
          }
        });

        if (shouldExecute) {
          const result = await executeRule(rule, applicationId, currentStage);
          actions.push(result.message);
          
          if (result.newStage) {
            return {
              success: true,
              actions,
              newStage: result.newStage,
              issues
            };
          }
        }
      }
    }

    return {
      success: true,
      actions,
      issues
    };

  } catch (error) {
    console.error('Workflow processing error:', error);
    return {
      success: false,
      actions: [`Error processing workflow: ${error}`],
      issues: ['Workflow automation failed']
    };
  }
};

/**
 * Get documents for a specific stage
 */
const getStageDocuments = async (applicationId: string, stageId: string) => {
  const stage = MORTGAGE_STAGES.find(s => s.id === stageId);
  if (!stage) return [];

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('application_id', applicationId)
    .in('document_type', stage.requiredDocuments);

  return documents || [];
};

/**
 * Evaluate if a rule should be executed
 */
const evaluateRule = async (
  rule: AutomationRule,
  context: {
    stage: ApplicationStage;
    documents: any[];
    application: any;
    newDocument: any;
  }
): Promise<boolean> => {
  switch (rule.condition) {
    case 'all_required_documents_uploaded':
      return context.stage.requiredDocuments.every(docType =>
        context.documents.some(doc => doc.document_type === docType)
      );

    case 'income_variance_high':
      const threshold = rule.parameters?.threshold || 20;
      // Check if income from different sources varies significantly
      const incomeFields = context.documents
        .filter(doc => doc.document_type === 'income_proof')
        .map(doc => doc.structured_data?.income)
        .filter(income => income);
      
      if (incomeFields.length >= 2) {
        const amounts = incomeFields.map(income => 
          parseFloat(String(income).replace(/[^0-9.]/g, ''))
        ).filter(amount => !isNaN(amount));
        
        if (amounts.length >= 2) {
          const max = Math.max(...amounts);
          const min = Math.min(...amounts);
          const variance = ((max - min) / min) * 100;
          return variance > threshold;
        }
      }
      return false;

    case 'income_verified':
      return context.documents.some(doc => 
        doc.document_type === 'income_proof' && doc.verified === true
      );

    case 'insufficient_assets':
      // Check if assets are sufficient for down payment
      const bankStatements = context.documents.filter(doc => 
        doc.document_type === 'bank_statement'
      );
      
      if (bankStatements.length > 0) {
        const totalAssets = bankStatements.reduce((sum, doc) => {
          const balance = parseFloat(String(doc.structured_data?.balance || '0').replace(/[^0-9.]/g, ''));
          return sum + (isNaN(balance) ? 0 : balance);
        }, 0);
        
        const purchasePrice = parseFloat(String(context.application.purchase_price || '0'));
        const requiredDownPayment = purchasePrice * 0.05; // 5% minimum
        
        return totalAssets < requiredDownPayment;
      }
      return false;

    case 'assets_verified':
      return context.documents.some(doc => 
        doc.document_type === 'bank_statement' && doc.verified === true
      );

    default:
      return false;
  }
};

/**
 * Execute a workflow rule
 */
const executeRule = async (
  rule: AutomationRule,
  applicationId: string,
  currentStage: ApplicationStage
): Promise<{ message: string; newStage?: string }> => {
  switch (rule.action) {
    case 'advance_stage':
      const nextStage = MORTGAGE_STAGES.find(s => s.order === currentStage.order + 1);
      if (nextStage) {
        await supabase
          .from('mortgage_applications')
          .update({
            stage: nextStage.id,
            progress: Math.round((nextStage.order / MORTGAGE_STAGES.length) * 100),
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        return {
          message: `Application automatically advanced to ${nextStage.name}`,
          newStage: nextStage.id
        };
      }
      return { message: 'Application completed all stages' };

    case 'flag_review':
      await supabase
        .from('mortgage_applications')
        .update({
          status: 'Under Review',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      return { message: 'Application flagged for manual review' };

    case 'request_documents':
      return { message: 'Additional documents requested from applicant' };

    case 'notify_agent':
      return { message: 'Agent notification sent' };

    default:
      return { message: 'Unknown action executed' };
  }
};

/**
 * Get current workflow status for an application
 */
export const getWorkflowStatus = async (applicationId: string): Promise<WorkflowStatus> => {
  try {
    const { data: application } = await supabase
      .from('mortgage_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (!application) {
      throw new Error('Application not found');
    }

    const currentStage = MORTGAGE_STAGES.find(s => s.id === application.stage);
    if (!currentStage) {
      throw new Error('Invalid stage');
    }

    // Get all documents for this application
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('application_id', applicationId);

    const blockers: string[] = [];
    const nextActions: string[] = [];

    // Check for missing required documents
    const missingDocs = currentStage.requiredDocuments.filter(docType =>
      !(documents || []).some(doc => doc.document_type === docType)
    );

    if (missingDocs.length > 0) {
      blockers.push(`Missing documents: ${missingDocs.join(', ')}`);
      nextActions.push('Upload required documents');
    }

    // Check for unverified documents
    const unverifiedDocs = (documents || []).filter(doc => 
      currentStage.requiredDocuments.includes(doc.document_type) && !doc.verified
    );

    if (unverifiedDocs.length > 0) {
      blockers.push(`Unverified documents: ${unverifiedDocs.length}`);
      nextActions.push('Complete document verification');
    }

    // Calculate estimated completion
    const avgProcessingDays = 14; // Average days for mortgage processing
    const progressRatio = application.progress / 100;
    const remainingDays = Math.round(avgProcessingDays * (1 - progressRatio));
    const estimatedCompletion = new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000)
      .toLocaleDateString();

    return {
      currentStage: currentStage.name,
      progress: application.progress,
      blockers,
      nextActions: nextActions.length > 0 ? nextActions : ['Application processing normally'],
      estimatedCompletion
    };

  } catch (error) {
    console.error('Error getting workflow status:', error);
    throw error;
  }
};

export default {
  processDocumentWorkflow,
  getWorkflowStatus,
  MORTGAGE_STAGES
};
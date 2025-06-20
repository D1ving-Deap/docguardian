import { DocumentType } from './types/ocrTypes';

// Mortgage application stages
export type ApplicationStage = 
  | 'initial_submission'
  | 'document_collection'
  | 'document_review'
  | 'underwriting'
  | 'conditional_approval'
  | 'final_approval'
  | 'closing'
  | 'funded';

// Export the stages array for components to use
export const MORTGAGE_STAGES: ApplicationStage[] = [
  'initial_submission',
  'document_collection',
  'document_review',
  'underwriting',
  'conditional_approval',
  'final_approval',
  'closing',
  'funded'
];

// Application status
export type ApplicationStatus = 
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'on_hold'
  | 'completed';

// Mortgage application interface
export interface MortgageApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  stage: ApplicationStage;
  status: ApplicationStatus;
  documents: ApplicationDocument[];
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  brokerId?: string;
  brokerNotes?: string;
  complianceChecks: ComplianceCheck[];
  nextActions: string[];
  blockers: string[];
}

// Application document interface
export interface ApplicationDocument {
  id: string;
  type: DocumentType;
  filename: string;
  uploadedAt: Date;
  processedAt?: Date;
  extractedFields: Record<string, any>;
  confidence: number;
  issues: string[];
  isVerified: boolean;
  verificationNotes?: string;
}

// Compliance check interface
export interface ComplianceCheck {
  id: string;
  type: 'fsra' | 'fintrac' | 'osfi' | 'cmhc';
  status: 'pending' | 'passed' | 'failed' | 'warning';
  description: string;
  checkedAt: Date;
  notes?: string;
}

// Automation rule interface
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
}

// Rule condition interface
export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'missing';
  value?: any;
}

// Rule action interface
export interface RuleAction {
  type: 'advance_stage' | 'send_notification' | 'create_task' | 'update_status' | 'flag_for_review';
  parameters: Record<string, any>;
}

// Automation rules for mortgage workflow
const MORTGAGE_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'auto-advance-document-collection',
    name: 'Auto-advance to Document Review',
    description: 'Automatically advance to document review when all required documents are uploaded',
    conditions: [
      { field: 'documents', operator: 'exists' },
      { field: 'requiredDocumentsComplete', operator: 'equals', value: true }
    ],
    actions: [
      { type: 'advance_stage', parameters: { stage: 'document_review' } },
      { type: 'send_notification', parameters: { recipient: 'broker', message: 'Application ready for document review' } }
    ],
    priority: 1,
    isActive: true
  },
  {
    id: 'auto-flag-incomplete-documents',
    name: 'Flag Incomplete Documents',
    description: 'Flag applications with missing or incomplete documents',
    conditions: [
      { field: 'requiredDocumentsComplete', operator: 'equals', value: false }
    ],
    actions: [
      { type: 'flag_for_review', parameters: { reason: 'Incomplete documents' } },
      { type: 'send_notification', parameters: { recipient: 'applicant', message: 'Please upload missing documents' } }
    ],
    priority: 2,
    isActive: true
  },
  {
    id: 'auto-advance-underwriting',
    name: 'Auto-advance to Underwriting',
    description: 'Advance to underwriting when documents are verified',
    conditions: [
      { field: 'documentsVerified', operator: 'equals', value: true },
      { field: 'stage', operator: 'equals', value: 'document_review' }
    ],
    actions: [
      { type: 'advance_stage', parameters: { stage: 'underwriting' } },
      { type: 'send_notification', parameters: { recipient: 'broker', message: 'Application moved to underwriting' } }
    ],
    priority: 1,
    isActive: true
  }
];

/**
 * Process document and trigger workflow automation
 */
export const processDocumentAndTriggerWorkflow = (
  application: MortgageApplication,
  document: ApplicationDocument
): {
  updatedApplication: MortgageApplication;
  triggeredActions: RuleAction[];
} => {
  let updatedApplication = { ...application };
  const triggeredActions: RuleAction[] = [];

  // Add document to application
  updatedApplication.documents = [...application.documents, document];
  updatedApplication.lastActivity = new Date();

  // Check if all required documents are complete
  const requiredDocumentsComplete = checkRequiredDocumentsComplete(updatedApplication);
  updatedApplication = {
    ...updatedApplication,
    status: requiredDocumentsComplete ? 'in_progress' : 'pending'
  };

  // Evaluate automation rules
  for (const rule of MORTGAGE_AUTOMATION_RULES) {
    if (!rule.isActive) continue;

    const shouldTrigger = evaluateRuleConditions(updatedApplication, rule.conditions);
    if (shouldTrigger) {
      triggeredActions.push(...rule.actions);
      
      // Execute actions
      for (const action of rule.actions) {
        updatedApplication = executeRuleAction(updatedApplication, action);
      }
    }
  }

  return { updatedApplication, triggeredActions };
};

/**
 * Advance application to next stage
 */
export const advanceApplicationStage = (
  application: MortgageApplication,
  targetStage: ApplicationStage
): MortgageApplication => {
  const stageOrder: ApplicationStage[] = [
    'initial_submission',
    'document_collection',
    'document_review',
    'underwriting',
    'conditional_approval',
    'final_approval',
    'closing',
    'funded'
  ];

  const currentIndex = stageOrder.indexOf(application.stage);
  const targetIndex = stageOrder.indexOf(targetStage);

  if (targetIndex <= currentIndex) {
    throw new Error(`Cannot advance to ${targetStage} from ${application.stage}`);
  }

  return {
    ...application,
    stage: targetStage,
    lastActivity: new Date(),
    nextActions: getNextActionsForStage(targetStage)
  };
};

/**
 * Get next actions for a specific stage
 */
export const getNextActionsForStage = (stage: ApplicationStage): string[] => {
  const stageActions: Record<ApplicationStage, string[]> = {
    'initial_submission': [
      'Collect applicant information',
      'Set up application file',
      'Send welcome email'
    ],
    'document_collection': [
      'Request required documents',
      'Send document checklist',
      'Schedule document review call'
    ],
    'document_review': [
      'Review uploaded documents',
      'Verify document authenticity',
      'Extract key information'
    ],
    'underwriting': [
      'Analyze financial information',
      'Assess creditworthiness',
      'Calculate debt-to-income ratio'
    ],
    'conditional_approval': [
      'Send conditional approval letter',
      'Request additional conditions',
      'Schedule follow-up'
    ],
    'final_approval': [
      'Send final approval letter',
      'Prepare closing documents',
      'Schedule closing date'
    ],
    'closing': [
      'Conduct final walkthrough',
      'Sign closing documents',
      'Transfer funds'
    ],
    'funded': [
      'Record mortgage',
      'Send confirmation',
      'Close application'
    ]
  };

  return stageActions[stage] || [];
};

/**
 * Check if all required documents are complete
 */
export const checkRequiredDocumentsComplete = (application: MortgageApplication): boolean => {
  const requiredDocumentTypes: DocumentType[] = [
    'mortgage_application',
    'income_proof',
    'bank_statement',
    'identification',
    'tax_document'
  ];

  const uploadedTypes = application.documents.map(doc => doc.type);
  return requiredDocumentTypes.every(type => uploadedTypes.includes(type));
};

/**
 * Evaluate rule conditions
 */
export const evaluateRuleConditions = (
  application: MortgageApplication,
  conditions: RuleCondition[]
): boolean => {
  return conditions.every(condition => {
    const value = getApplicationFieldValue(application, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'greater_than':
        return typeof value === 'number' && value > condition.value;
      case 'less_than':
        return typeof value === 'number' && value < condition.value;
      case 'exists':
        return value !== undefined && value !== null;
      case 'missing':
        return value === undefined || value === null;
      default:
        return false;
    }
  });
};

/**
 * Execute rule action
 */
export const executeRuleAction = (
  application: MortgageApplication,
  action: RuleAction
): MortgageApplication => {
  switch (action.type) {
    case 'advance_stage':
      return advanceApplicationStage(application, action.parameters.stage);
    case 'update_status':
      return { ...application, status: action.parameters.status };
    case 'flag_for_review':
      return {
        ...application,
        blockers: [...application.blockers, action.parameters.reason]
      };
    default:
      return application;
  }
};

/**
 * Get application field value
 */
export const getApplicationFieldValue = (application: MortgageApplication, field: string): any => {
  switch (field) {
    case 'documents':
      return application.documents;
    case 'requiredDocumentsComplete':
      return checkRequiredDocumentsComplete(application);
    case 'documentsVerified':
      return application.documents.every(doc => doc.isVerified);
    case 'stage':
      return application.stage;
    case 'status':
      return application.status;
    default:
      return (application as any)[field];
  }
};

/**
 * Create new mortgage application
 */
export const createMortgageApplication = (
  applicantData: Partial<MortgageApplication>
): MortgageApplication => {
  return {
    id: crypto.randomUUID(),
    applicantId: applicantData.applicantId || crypto.randomUUID(),
    applicantName: applicantData.applicantName || '',
    email: applicantData.email || '',
    phone: applicantData.phone || '',
    propertyAddress: applicantData.propertyAddress || '',
    purchasePrice: applicantData.purchasePrice || 0,
    downPayment: applicantData.downPayment || 0,
    loanAmount: applicantData.loanAmount || 0,
    stage: 'initial_submission',
    status: 'pending',
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivity: new Date(),
    complianceChecks: [],
    nextActions: getNextActionsForStage('initial_submission'),
    blockers: [],
    ...applicantData
  };
};

/**
 * Get workflow status for an application
 */
export const getWorkflowStatus = (application: MortgageApplication): {
  currentStage: ApplicationStage;
  progress: number;
  nextStage?: ApplicationStage;
  isComplete: boolean;
  blockers: string[];
} => {
  const currentStageIndex = MORTGAGE_STAGES.indexOf(application.stage);
  const progress = ((currentStageIndex + 1) / MORTGAGE_STAGES.length) * 100;
  const nextStage = currentStageIndex < MORTGAGE_STAGES.length - 1 
    ? MORTGAGE_STAGES[currentStageIndex + 1] 
    : undefined;
  const isComplete = application.stage === 'funded';
  
  return {
    currentStage: application.stage,
    progress: Math.round(progress),
    nextStage,
    isComplete,
    blockers: application.blockers || []
  };
};

export default {
  processDocumentAndTriggerWorkflow,
  advanceApplicationStage,
  getNextActionsForStage,
  checkRequiredDocumentsComplete,
  createMortgageApplication,
  getWorkflowStatus,
  MORTGAGE_STAGES
}; 
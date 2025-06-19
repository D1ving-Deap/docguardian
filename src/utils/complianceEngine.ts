import { MortgageApplication, ApplicationDocument, ComplianceCheck } from './workflowAutomation';
import { DocumentType } from './types/ocrTypes';

// Regulatory compliance types
export type RegulatoryBody = 'fsra' | 'fintrac' | 'osfi' | 'cmhc';

// Compliance rule interface
export interface ComplianceRule {
  id: string;
  regulatoryBody: RegulatoryBody;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  validate: (application: MortgageApplication) => ComplianceValidationResult;
}

// Compliance validation result
export interface ComplianceValidationResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

// FSRA (Financial Services Regulatory Authority) rules
const FSRA_RULES: ComplianceRule[] = [
  {
    id: 'fsra-001',
    regulatoryBody: 'fsra',
    name: 'Mortgage Broker License Verification',
    description: 'Verify that the mortgage broker is properly licensed',
    severity: 'critical',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      if (!application.brokerId) {
        issues.push('No broker ID associated with application');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        warnings,
        recommendations: ['Ensure broker license is valid and up to date']
      };
    }
  },
  {
    id: 'fsra-002',
    regulatoryBody: 'fsra',
    name: 'Disclosure Requirements',
    description: 'Ensure all required disclosures are provided to the applicant',
    severity: 'high',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Check if disclosure documents are present
      const hasDisclosureDocs = application.documents.some(doc => 
        doc.filename.toLowerCase().includes('disclosure') ||
        doc.filename.toLowerCase().includes('agreement')
      );
      
      if (!hasDisclosureDocs) {
        warnings.push('Disclosure documents not found in application');
      }
      
      return {
        passed: true,
        issues,
        warnings,
        recommendations: ['Ensure all disclosure documents are signed and uploaded']
      };
    }
  }
];

// FINTRAC (Financial Transactions and Reports Analysis Centre) rules
const FINTRAC_RULES: ComplianceRule[] = [
  {
    id: 'fintrac-001',
    regulatoryBody: 'fintrac',
    name: 'Client Identification',
    description: 'Verify proper client identification procedures',
    severity: 'critical',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Check for identification documents
      const hasIdDocs = application.documents.some(doc => 
        doc.type === 'identification' && doc.isVerified
      );
      
      if (!hasIdDocs) {
        issues.push('Valid identification documents not found');
      }
      
      // Check for SIN verification
      const hasSIN = application.documents.some(doc => 
        doc.extractedFields?.sin || doc.extractedFields?.socialInsuranceNumber
      );
      
      if (!hasSIN) {
        warnings.push('SIN verification not found');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        warnings,
        recommendations: ['Ensure proper client identification and SIN verification']
      };
    }
  },
  {
    id: 'fintrac-002',
    regulatoryBody: 'fintrac',
    name: 'Large Transaction Reporting',
    description: 'Check if transaction requires large transaction report',
    severity: 'high',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Check if loan amount exceeds reporting threshold
      const LARGE_TRANSACTION_THRESHOLD = 10000; // $10,000 CAD
      
      if (application.loanAmount > LARGE_TRANSACTION_THRESHOLD) {
        warnings.push(`Loan amount ($${application.loanAmount.toLocaleString()}) exceeds large transaction reporting threshold`);
      }
      
      return {
        passed: true,
        issues,
        warnings,
        recommendations: ['Consider filing large transaction report if required']
      };
    }
  }
];

// OSFI (Office of the Superintendent of Financial Institutions) rules
const OSFI_RULES: ComplianceRule[] = [
  {
    id: 'osfi-001',
    regulatoryBody: 'osfi',
    name: 'Stress Testing Requirements',
    description: 'Verify stress testing compliance for mortgage applications',
    severity: 'high',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Check if stress testing was performed
      const hasStressTest = application.documents.some(doc => 
        doc.filename.toLowerCase().includes('stress') ||
        doc.filename.toLowerCase().includes('qualification')
      );
      
      if (!hasStressTest) {
        warnings.push('Stress testing documentation not found');
      }
      
      return {
        passed: true,
        issues,
        warnings,
        recommendations: ['Ensure stress testing is performed and documented']
      };
    }
  },
  {
    id: 'osfi-002',
    regulatoryBody: 'osfi',
    name: 'Debt-to-Income Ratio',
    description: 'Verify debt-to-income ratio compliance',
    severity: 'high',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Calculate DTI ratio (simplified)
      const income = application.documents
        .filter(doc => doc.type === 'income_proof')
        .reduce((total, doc) => {
          const extractedIncome = doc.extractedFields?.income || doc.extractedFields?.annualIncome || 0;
          return total + Number(extractedIncome);
        }, 0);
      
      if (income > 0) {
        const dtiRatio = (application.loanAmount / income) * 100;
        const MAX_DTI_RATIO = 44; // OSFI guideline
        
        if (dtiRatio > MAX_DTI_RATIO) {
          issues.push(`Debt-to-income ratio (${dtiRatio.toFixed(1)}%) exceeds maximum allowed (${MAX_DTI_RATIO}%)`);
        } else if (dtiRatio > MAX_DTI_RATIO * 0.8) {
          warnings.push(`Debt-to-income ratio (${dtiRatio.toFixed(1)}%) is approaching maximum allowed`);
        }
      } else {
        warnings.push('Unable to calculate debt-to-income ratio - income information missing');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        warnings,
        recommendations: ['Ensure debt-to-income ratio is within acceptable limits']
      };
    }
  }
];

// CMHC (Canada Mortgage and Housing Corporation) rules
const CMHC_RULES: ComplianceRule[] = [
  {
    id: 'cmhc-001',
    regulatoryBody: 'cmhc',
    name: 'Down Payment Requirements',
    description: 'Verify minimum down payment requirements',
    severity: 'critical',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      const downPaymentPercentage = (application.downPayment / application.purchasePrice) * 100;
      const MIN_DOWN_PAYMENT = 5; // Minimum 5% for CMHC-insured mortgages
      
      if (downPaymentPercentage < MIN_DOWN_PAYMENT) {
        issues.push(`Down payment (${downPaymentPercentage.toFixed(1)}%) is below minimum required (${MIN_DOWN_PAYMENT}%)`);
      } else if (downPaymentPercentage < MIN_DOWN_PAYMENT * 1.2) {
        warnings.push(`Down payment (${downPaymentPercentage.toFixed(1)}%) is close to minimum required`);
      }
      
      return {
        passed: issues.length === 0,
        issues,
        warnings,
        recommendations: ['Ensure down payment meets minimum requirements']
      };
    }
  },
  {
    id: 'cmhc-002',
    regulatoryBody: 'cmhc',
    name: 'Property Value Assessment',
    description: 'Verify property value assessment for CMHC insurance',
    severity: 'high',
    validate: (application: MortgageApplication) => {
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Check for property assessment documents
      const hasAssessment = application.documents.some(doc => 
        doc.filename.toLowerCase().includes('assessment') ||
        doc.filename.toLowerCase().includes('appraisal')
      );
      
      if (!hasAssessment) {
        warnings.push('Property assessment or appraisal not found');
      }
      
      return {
        passed: true,
        issues,
        warnings,
        recommendations: ['Ensure property assessment is completed for CMHC insurance']
      };
    }
  }
];

// All compliance rules
const ALL_COMPLIANCE_RULES = [
  ...FSRA_RULES,
  ...FINTRAC_RULES,
  ...OSFI_RULES,
  ...CMHC_RULES
];

/**
 * Run comprehensive compliance check on mortgage application
 */
export const runComplianceCheck = (
  application: MortgageApplication
): {
  overallStatus: 'compliant' | 'non_compliant' | 'needs_review';
  checks: ComplianceCheck[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
} => {
  const checks: ComplianceCheck[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let warningCount = 0;

  // Run all compliance rules
  for (const rule of ALL_COMPLIANCE_RULES) {
    const result = rule.validate(application);
    const hasIssues = result.issues.length > 0;
    const hasWarnings = result.warnings.length > 0;
    
    let status: ComplianceCheck['status'] = 'passed';
    if (hasIssues) {
      status = 'failed';
      failedCount++;
    } else if (hasWarnings) {
      status = 'warning';
      warningCount++;
    } else {
      passedCount++;
    }

    checks.push({
      id: rule.id,
      type: rule.regulatoryBody,
      status,
      description: rule.description,
      checkedAt: new Date(),
      notes: hasIssues ? result.issues.join('; ') : 
             hasWarnings ? result.warnings.join('; ') : 
             'All checks passed'
    });
  }

  // Determine overall status
  let overallStatus: 'compliant' | 'non_compliant' | 'needs_review';
  if (failedCount === 0 && warningCount === 0) {
    overallStatus = 'compliant';
  } else if (failedCount > 0) {
    overallStatus = 'non_compliant';
  } else {
    overallStatus = 'needs_review';
  }

  return {
    overallStatus,
    checks,
    summary: {
      totalChecks: checks.length,
      passed: passedCount,
      failed: failedCount,
      warnings: warningCount
    }
  };
};

/**
 * Generate compliance report
 */
export const generateComplianceReport = (
  application: MortgageApplication,
  complianceResult: ReturnType<typeof runComplianceCheck>
): string => {
  const { overallStatus, checks, summary } = complianceResult;
  
  let report = `# Compliance Report for Application ${application.id}\n\n`;
  report += `**Applicant:** ${application.applicantName}\n`;
  report += `**Date:** ${new Date().toLocaleDateString()}\n`;
  report += `**Overall Status:** ${overallStatus.toUpperCase()}\n\n`;
  
  report += `## Summary\n`;
  report += `- Total Checks: ${summary.totalChecks}\n`;
  report += `- Passed: ${summary.passed}\n`;
  report += `- Failed: ${summary.failed}\n`;
  report += `- Warnings: ${summary.warnings}\n\n`;
  
  report += `## Detailed Results\n\n`;
  
  // Group by regulatory body
  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.type]) acc[check.type] = [];
    acc[check.type].push(check);
    return acc;
  }, {} as Record<string, ComplianceCheck[]>);
  
  for (const [regulatoryBody, bodyChecks] of Object.entries(groupedChecks)) {
    report += `### ${regulatoryBody.toUpperCase()}\n\n`;
    
    for (const check of bodyChecks) {
      const statusIcon = check.status === 'passed' ? '✅' : 
                        check.status === 'failed' ? '❌' : '⚠️';
      
      report += `${statusIcon} **${check.description}**\n`;
      report += `- Status: ${check.status}\n`;
      if (check.notes) {
        report += `- Notes: ${check.notes}\n`;
      }
      report += `\n`;
    }
  }
  
  return report;
};

/**
 * Get compliance recommendations
 */
export const getComplianceRecommendations = (
  complianceResult: ReturnType<typeof runComplianceCheck>
): string[] => {
  const recommendations: string[] = [];
  
  for (const check of complianceResult.checks) {
    if (check.status === 'failed') {
      recommendations.push(`Address ${check.description}: ${check.notes}`);
    } else if (check.status === 'warning') {
      recommendations.push(`Review ${check.description}: ${check.notes}`);
    }
  }
  
  return recommendations;
};

export default {
  runComplianceCheck,
  generateComplianceReport,
  getComplianceRecommendations
};
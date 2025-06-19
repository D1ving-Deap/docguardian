import { DocumentType } from './types/ocrTypes';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'FSRA' | 'FINTRAC' | 'OSFI' | 'CMHC' | 'INTERNAL';
  severity: 'critical' | 'high' | 'medium' | 'low';
  automated: boolean;
  validate: (data: ApplicationData) => ComplianceResult;
}

export interface ApplicationData {
  applicantInfo: {
    name?: string;
    dateOfBirth?: string;
    sin?: string;
    address?: string;
    maritalStatus?: string;
    income?: number;
    employer?: string;
  };
  documents: Array<{
    type: DocumentType;
    extractedFields: Record<string, any>;
    verified: boolean;
    uploadDate: string;
  }>;
  propertyInfo?: {
    address?: string;
    purchasePrice?: number;
    downPayment?: number;
    propertyType?: string;
  };
  loanInfo?: {
    amountRequested?: number;
    term?: number;
    rate?: number;
    paymentFrequency?: string;
  };
}

export interface ComplianceResult {
  passed: boolean;
  score: number; // 0-100
  violations: ComplianceViolation[];
  recommendations: string[];
  requiredActions: string[];
}

export interface ComplianceViolation {
  ruleId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  documentId?: string;
  fieldName?: string;
  suggestedFix?: string;
}

// Canadian mortgage compliance rules
export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'INCOME_VERIFICATION',
    name: 'Income Verification Requirements',
    description: 'Verify that income documentation meets regulatory standards',
    category: 'FSRA',
    severity: 'critical',
    automated: true,
    validate: (data: ApplicationData) => {
      const violations: ComplianceViolation[] = [];
      const recommendations: string[] = [];
      const requiredActions: string[] = [];

      // Check for income documentation
      const incomeDocuments = data.documents.filter(doc => 
        doc.type === 'income_proof' || doc.type === 'tax_document'
      );

      if (incomeDocuments.length === 0) {
        violations.push({
          ruleId: 'INCOME_VERIFICATION',
          severity: 'critical',
          message: 'No income verification documents provided',
          suggestedFix: 'Upload recent pay stubs or T4/tax returns'
        });
        requiredActions.push('Obtain income verification documents');
      }

      // Verify income consistency
      if (data.applicantInfo.income && incomeDocuments.length > 0) {
        const documentedIncomes = incomeDocuments
          .map(doc => doc.extractedFields.income)
          .filter(income => income)
          .map(income => parseFloat(String(income).replace(/[^0-9.]/g, '')));

        if (documentedIncomes.length > 0) {
          const avgDocumentedIncome = documentedIncomes.reduce((a, b) => a + b, 0) / documentedIncomes.length;
          const reportedIncome = data.applicantInfo.income;
          const variance = Math.abs(avgDocumentedIncome - reportedIncome) / reportedIncome;

          if (variance > 0.15) { // 15% variance threshold
            violations.push({
              ruleId: 'INCOME_VERIFICATION',
              severity: 'high',
              message: `Income variance of ${(variance * 100).toFixed(1)}% between reported and documented income`,
              suggestedFix: 'Investigate income discrepancy and obtain additional documentation'
            });
            requiredActions.push('Resolve income discrepancy');
          }
        }
      }

      const score = Math.max(0, 100 - (violations.length * 25));
      return {
        passed: violations.filter(v => v.severity === 'critical').length === 0,
        score,
        violations,
        recommendations,
        requiredActions
      };
    }
  },
  {
    id: 'DEBT_SERVICE_RATIO',
    name: 'Debt Service Ratio Compliance',
    description: 'Ensure debt service ratios meet regulatory requirements',
    category: 'OSFI',
    severity: 'critical',
    automated: true,
    validate: (data: ApplicationData) => {
      const violations: ComplianceViolation[] = [];
      const recommendations: string[] = [];
      const requiredActions: string[] = [];

      if (data.applicantInfo.income && data.loanInfo?.amountRequested) {
        const monthlyIncome = data.applicantInfo.income / 12;
        const loanAmount = data.loanInfo.amountRequested;
        const estimatedPayment = loanAmount * 0.005; // Rough estimate

        // Gross Debt Service Ratio (GDS) - should not exceed 32%
        const gdsRatio = (estimatedPayment / monthlyIncome) * 100;
        if (gdsRatio > 32) {
          violations.push({
            ruleId: 'DEBT_SERVICE_RATIO',
            severity: 'critical',
            message: `GDS ratio of ${gdsRatio.toFixed(1)}% exceeds maximum allowed 32%`,
            suggestedFix: 'Reduce loan amount or increase down payment'
          });
          requiredActions.push('Adjust loan parameters to meet GDS requirements');
        } else if (gdsRatio > 28) {
          recommendations.push('Consider reducing loan amount for better approval chances');
        }

        // Total Debt Service Ratio (TDS) - estimate at 40% max
        const tdsRatio = gdsRatio + 8; // Assume some existing debt
        if (tdsRatio > 40) {
          violations.push({
            ruleId: 'DEBT_SERVICE_RATIO',
            severity: 'high',
            message: `Estimated TDS ratio of ${tdsRatio.toFixed(1)}% may exceed maximum allowed 40%`,
            suggestedFix: 'Obtain detailed debt information and reassess'
          });
          requiredActions.push('Verify total debt obligations');
        }
      }

      const score = Math.max(0, 100 - (violations.length * 30));
      return {
        passed: violations.filter(v => v.severity === 'critical').length === 0,
        score,
        violations,
        recommendations,
        requiredActions
      };
    }
  },
  {
    id: 'IDENTIFICATION_VERIFICATION',
    name: 'Identity Verification Requirements',
    description: 'Verify customer identification meets FINTRAC requirements',
    category: 'FINTRAC',
    severity: 'critical',
    automated: true,
    validate: (data: ApplicationData) => {
      const violations: ComplianceViolation[] = [];
      const recommendations: string[] = [];
      const requiredActions: string[] = [];

      // Check for identification documents
      const idDocuments = data.documents.filter(doc => doc.type === 'identification');

      if (idDocuments.length === 0) {
        violations.push({
          ruleId: 'IDENTIFICATION_VERIFICATION',
          severity: 'critical',
          message: 'No government-issued identification provided',
          suggestedFix: 'Upload driver\'s license, passport, or other government ID'
        });
        requiredActions.push('Obtain valid government identification');
      } else {
        // Verify ID document completeness
        const idDoc = idDocuments[0];
        const requiredFields = ['name', 'dateOfBirth', 'idNumber'];
        const missingFields = requiredFields.filter(field => !idDoc.extractedFields[field]);

        if (missingFields.length > 0) {
          violations.push({
            ruleId: 'IDENTIFICATION_VERIFICATION',
            severity: 'high',
            message: `Missing required ID fields: ${missingFields.join(', ')}`,
            documentId: idDoc.type,
            suggestedFix: 'Ensure ID document is clear and complete'
          });
          requiredActions.push('Obtain clearer identification document');
        }

        // Verify name consistency
        if (data.applicantInfo.name && idDoc.extractedFields.name) {
          const normalizedAppName = data.applicantInfo.name.toLowerCase().replace(/\s+/g, '');
          const normalizedIdName = idDoc.extractedFields.name.toLowerCase().replace(/\s+/g, '');
          
          if (normalizedAppName !== normalizedIdName) {
            violations.push({
              ruleId: 'IDENTIFICATION_VERIFICATION',
              severity: 'medium',
              message: 'Name mismatch between application and identification',
              suggestedFix: 'Verify correct spelling and legal name'
            });
            recommendations.push('Confirm legal name matches all documents');
          }
        }
      }

      const score = Math.max(0, 100 - (violations.length * 20));
      return {
        passed: violations.filter(v => v.severity === 'critical').length === 0,
        score,
        violations,
        recommendations,
        requiredActions
      };
    }
  },
  {
    id: 'DOWN_PAYMENT_VERIFICATION',
    name: 'Down Payment Source Verification',
    description: 'Verify down payment meets minimum requirements and source verification',
    category: 'CMHC',
    severity: 'high',
    automated: true,
    validate: (data: ApplicationData) => {
      const violations: ComplianceViolation[] = [];
      const recommendations: string[] = [];
      const requiredActions: string[] = [];

      if (data.propertyInfo?.purchasePrice && data.propertyInfo?.downPayment) {
        const purchasePrice = data.propertyInfo.purchasePrice;
        const downPayment = data.propertyInfo.downPayment;
        const downPaymentPercent = (downPayment / purchasePrice) * 100;

        // Minimum down payment requirements
        if (purchasePrice <= 500000) {
          if (downPaymentPercent < 5) {
            violations.push({
              ruleId: 'DOWN_PAYMENT_VERIFICATION',
              severity: 'critical',
              message: `Down payment of ${downPaymentPercent.toFixed(1)}% is below minimum 5% required`,
              suggestedFix: 'Increase down payment to meet minimum requirements'
            });
            requiredActions.push('Increase down payment amount');
          }
        } else if (purchasePrice <= 1000000) {
          const requiredAmount = 25000 + (purchasePrice - 500000) * 0.1;
          if (downPayment < requiredAmount) {
            violations.push({
              ruleId: 'DOWN_PAYMENT_VERIFICATION',
              severity: 'critical',
              message: `Down payment of $${downPayment.toLocaleString()} is below required $${requiredAmount.toLocaleString()}`,
              suggestedFix: 'Increase down payment to meet tiered requirements'
            });
            requiredActions.push('Increase down payment amount');
          }
        } else {
          if (downPaymentPercent < 20) {
            violations.push({
              ruleId: 'DOWN_PAYMENT_VERIFICATION',
              severity: 'critical',
              message: `Down payment of ${downPaymentPercent.toFixed(1)}% is below minimum 20% for properties over $1M`,
              suggestedFix: 'Increase down payment to 20% minimum'
            });
            requiredActions.push('Increase down payment amount');
          }
        }

        // Verify source of down payment
        const bankStatements = data.documents.filter(doc => doc.type === 'bank_statement');
        if (bankStatements.length === 0) {
          violations.push({
            ruleId: 'DOWN_PAYMENT_VERIFICATION',
            severity: 'high',
            message: 'No bank statements provided to verify down payment source',
            suggestedFix: 'Upload recent bank statements showing available funds'
          });
          requiredActions.push('Provide bank statements for down payment verification');
        }
      }

      const score = Math.max(0, 100 - (violations.length * 25));
      return {
        passed: violations.filter(v => v.severity === 'critical').length === 0,
        score,
        violations,
        recommendations,
        requiredActions
      };
    }
  },
  {
    id: 'DOCUMENT_AUTHENTICITY',
    name: 'Document Authenticity Verification',
    description: 'Verify documents show no signs of tampering or fraud',
    category: 'INTERNAL',
    severity: 'high',
    automated: true,
    validate: (data: ApplicationData) => {
      const violations: ComplianceViolation[] = [];
      const recommendations: string[] = [];
      const requiredActions: string[] = [];

      // Check for document metadata issues
      data.documents.forEach(doc => {
        if (doc.extractedFields.metadata) {
          try {
            const metadata = JSON.parse(doc.extractedFields.metadata);
            
            // Check OCR confidence
            if (metadata.confidence < 70) {
              violations.push({
                ruleId: 'DOCUMENT_AUTHENTICITY',
                severity: 'medium',
                message: `Low OCR confidence (${metadata.confidence}%) for ${doc.type}`,
                documentId: doc.type,
                suggestedFix: 'Request higher quality document scan'
              });
              recommendations.push(`Obtain clearer copy of ${doc.type}`);
            }

            // Check if document was recently edited
            if (metadata.edited) {
              violations.push({
                ruleId: 'DOCUMENT_AUTHENTICITY',
                severity: 'high',
                message: `Document ${doc.type} shows signs of recent modification`,
                documentId: doc.type,
                suggestedFix: 'Request original unmodified document'
              });
              requiredActions.push(`Verify authenticity of ${doc.type}`);
            }
          } catch (e) {
            // Ignore metadata parsing errors
          }
        }

        // Check for unverified documents
        if (!doc.verified) {
          recommendations.push(`Manual verification recommended for ${doc.type}`);
        }
      });

      const score = Math.max(0, 100 - (violations.length * 15));
      return {
        passed: violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
        score,
        violations,
        recommendations,
        requiredActions
      };
    }
  }
];

/**
 * Run comprehensive compliance check on application data
 */
export const runComplianceCheck = (data: ApplicationData): ComplianceResult => {
  let overallScore = 0;
  let totalViolations: ComplianceViolation[] = [];
  let totalRecommendations: string[] = [];
  let totalRequiredActions: string[] = [];
  let criticalFailures = 0;

  // Run all compliance rules
  for (const rule of COMPLIANCE_RULES) {
    try {
      const result = rule.validate(data);
      
      overallScore += result.score;
      totalViolations.push(...result.violations);
      totalRecommendations.push(...result.recommendations);
      totalRequiredActions.push(...result.requiredActions);

      if (!result.passed) {
        criticalFailures++;
      }
    } catch (error) {
      console.error(`Error running compliance rule ${rule.id}:`, error);
      totalViolations.push({
        ruleId: rule.id,
        severity: 'medium',
        message: `Error validating ${rule.name}`,
        suggestedFix: 'Manual review required'
      });
    }
  }

  // Calculate average score
  const avgScore = overallScore / COMPLIANCE_RULES.length;

  // Remove duplicates
  const uniqueRecommendations = [...new Set(totalRecommendations)];
  const uniqueRequiredActions = [...new Set(totalRequiredActions)];

  return {
    passed: criticalFailures === 0 && avgScore >= 70,
    score: Math.round(avgScore),
    violations: totalViolations,
    recommendations: uniqueRecommendations,
    requiredActions: uniqueRequiredActions
  };
};

/**
 * Generate compliance report
 */
export const generateComplianceReport = (
  applicationId: string,
  data: ApplicationData,
  result: ComplianceResult
): string => {
  const timestamp = new Date().toLocaleString();
  
  let report = `MORTGAGE APPLICATION COMPLIANCE REPORT\n`;
  report += `Application ID: ${applicationId}\n`;
  report += `Generated: ${timestamp}\n`;
  report += `Overall Score: ${result.score}/100\n`;
  report += `Status: ${result.passed ? 'COMPLIANT' : 'NON-COMPLIANT'}\n\n`;

  // Violations by severity
  const critical = result.violations.filter(v => v.severity === 'critical');
  const high = result.violations.filter(v => v.severity === 'high');
  const medium = result.violations.filter(v => v.severity === 'medium');
  const low = result.violations.filter(v => v.severity === 'low');

  if (critical.length > 0) {
    report += `CRITICAL VIOLATIONS (${critical.length}):\n`;
    critical.forEach((v, i) => {
      report += `${i + 1}. ${v.message}\n`;
      if (v.suggestedFix) report += `   Fix: ${v.suggestedFix}\n`;
    });
    report += '\n';
  }

  if (high.length > 0) {
    report += `HIGH SEVERITY VIOLATIONS (${high.length}):\n`;
    high.forEach((v, i) => {
      report += `${i + 1}. ${v.message}\n`;
      if (v.suggestedFix) report += `   Fix: ${v.suggestedFix}\n`;
    });
    report += '\n';
  }

  if (medium.length > 0) {
    report += `MEDIUM SEVERITY VIOLATIONS (${medium.length}):\n`;
    medium.forEach((v, i) => {
      report += `${i + 1}. ${v.message}\n`;
    });
    report += '\n';
  }

  if (result.requiredActions.length > 0) {
    report += `REQUIRED ACTIONS:\n`;
    result.requiredActions.forEach((action, i) => {
      report += `${i + 1}. ${action}\n`;
    });
    report += '\n';
  }

  if (result.recommendations.length > 0) {
    report += `RECOMMENDATIONS:\n`;
    result.recommendations.forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });
    report += '\n';
  }

  report += `\nThis report was generated automatically by the DocGuardian compliance engine.\n`;
  report += `For questions or manual review requests, contact your compliance officer.\n`;

  return report;
};

export default {
  runComplianceCheck,
  generateComplianceReport,
  COMPLIANCE_RULES
};
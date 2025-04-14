
import { ExtractedFields } from './fieldExtraction';

// Analyzes extracted fields to detect potential issues
export const analyzeForIssues = (extractedFields: ExtractedFields, docType: string): Array<{ severity: string; message: string }> => {
  const issues: Array<{ severity: string; message: string }> = [];
  
  // Parse the metadata
  try {
    const metadata = JSON.parse(extractedFields.metadata as string);
    const confidence = metadata.confidence;
    
    // Flag low confidence
    if (confidence < 60) {
      issues.push({
        severity: 'warning',
        message: 'Low confidence in extracted text, manual review recommended'
      });
    }
  } catch (e) {
    // Metadata parsing issue
    issues.push({
      severity: 'error',
      message: 'Error parsing document metadata'
    });
  }
  
  // Income document checks
  if (docType.toLowerCase().includes('income') || docType.toLowerCase().includes('pay')) {
    // Check for missing income
    if (!extractedFields.income) {
      issues.push({
        severity: 'error',
        message: 'No income amount detected in document'
      });
    }
    
    // Check for missing statement date
    if (!extractedFields.statementDate) {
      issues.push({
        severity: 'warning',
        message: 'Statement date not found in document'
      });
    }
  }
  
  // ID document checks
  if (docType.toLowerCase().includes('id') || docType.toLowerCase().includes('license')) {
    // Check for missing name
    if (!extractedFields.name) {
      issues.push({
        severity: 'error',
        message: 'No name detected in ID document'
      });
    }
    
    // Check for missing DOB
    if (!extractedFields.dateOfBirth) {
      issues.push({
        severity: 'error',
        message: 'Date of birth not found in ID document'
      });
    }
    
    // Check for missing ID number
    if (!extractedFields.idNumber) {
      issues.push({
        severity: 'warning',
        message: 'ID number not clearly detected'
      });
    }
  }
  
  // Simulate some random issues for demo purposes
  if (issues.length === 0 && Math.random() > 0.7) {
    if (docType.toLowerCase().includes('income')) {
      issues.push({
        severity: 'warning',
        message: 'Unusual income pattern detected'
      });
    } else if (docType.toLowerCase().includes('id')) {
      issues.push({
        severity: 'warning',
        message: 'Potential document formatting inconsistency'
      });
    } else {
      issues.push({
        severity: 'info',
        message: 'Document requires additional verification'
      });
    }
  }
  
  return issues;
};

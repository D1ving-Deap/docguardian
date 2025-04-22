
// Import from implementation files
import { performOCR } from './tesseractOCR';
import { extractFieldsFromText } from './fieldExtraction';
import { analyzeForIssues } from './issueAnalysis';

// Import from types file
import type { 
  OCRResult, 
  ExtractedFields, 
  DocumentIssue, 
  ProcessedDocument, 
  DocumentType,
  OCRMetadata,
  IssueSeverity
} from './types/ocrTypes';

/**
 * Document analysis result interface
 */
export interface DocumentAnalysisResult {
  documentId: string;
  text: string;
  extractedFields: ExtractedFields;
  issues: DocumentIssue[];
}

// Re-export types
export type {
  OCRResult,
  ExtractedFields,
  DocumentIssue,
  ProcessedDocument,
  DocumentType,
  OCRMetadata,
  IssueSeverity
};

// Re-export implementation functions
export {
  performOCR,
  extractFieldsFromText as extractFields,
  analyzeForIssues
};

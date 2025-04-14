
// Import from implementation files
import { performOCR } from './tesseractOCR';
import { extractFieldsFromText } from './fieldExtraction';
import { analyzeForIssues } from './issueAnalysis';

// Import from types file
import { 
  OCRResult, 
  ExtractedFields, 
  DocumentIssue, 
  ProcessedDocument, 
  DocumentType,
  OCRMetadata,
  IssueSeverity
} from './types/ocrTypes';

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
  extractFieldsFromText,
  analyzeForIssues
};

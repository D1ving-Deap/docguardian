
/**
 * Core OCR processing result
 */
export interface OCRResult {
  text: string;
  confidence: number;
  progress: number;
}

/**
 * Document type categories
 */
export type DocumentType = 
  | 'income_proof'
  | 'identification'
  | 'mortgage_application'
  | 'bank_statement'
  | 'tax_document'
  | 'generic';

/**
 * Extracted fields from OCR text
 */
export interface ExtractedFields {
  [key: string]: string | number;
  metadata: string;
}

/**
 * Metadata from extracted fields
 */
export interface OCRMetadata {
  processed: string;
  confidence: number;
  edited: boolean;
}

/**
 * Issue severity levels
 */
export type IssueSeverity = 'info' | 'warning' | 'error';

/**
 * Document processing issue
 */
export interface DocumentIssue {
  severity: IssueSeverity;
  message: string;
}

/**
 * Complete OCR processing result including extracted data and issues
 */
export interface ProcessedDocument {
  documentId: string;
  text: string;
  extractedFields: ExtractedFields;
  issues: DocumentIssue[];
  confidence: number;
}

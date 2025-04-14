
import { performOCR, OCRResult } from './tesseractOCR';
import { extractFieldsFromText, ExtractedFields } from './fieldExtraction';
import { analyzeForIssues } from './issueAnalysis';

// Use export type for type re-exports
export type { OCRResult, ExtractedFields };

// Re-export functions as before
export { 
  performOCR, 
  extractFieldsFromText, 
  analyzeForIssues 
};

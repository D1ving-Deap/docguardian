
import { OCRResult, performOCR } from './tesseractOCR';
import { ExtractedFields, extractFieldsFromText } from './fieldExtraction';
import { analyzeForIssues } from './issueAnalysis';

// Re-export everything from the individual modules
export { OCRResult, performOCR, ExtractedFields, extractFieldsFromText, analyzeForIssues };

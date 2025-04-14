
import { OCRMetadata, ExtractedFields } from '../types/ocrTypes';

/**
 * Parse metadata from extracted fields
 * @param extractedFields The extracted fields from OCR processing
 * @returns Parsed metadata object or null if parsing fails
 */
export const parseOCRMetadata = (extractedFields: ExtractedFields): OCRMetadata | null => {
  try {
    if (!extractedFields.metadata) {
      return null;
    }
    
    return JSON.parse(extractedFields.metadata as string) as OCRMetadata;
  } catch (error) {
    console.error('Failed to parse OCR metadata:', error);
    return null;
  }
};

/**
 * Get confidence level from extracted fields
 * @param extractedFields The extracted fields from OCR processing
 * @returns Confidence level or 0 if not available
 */
export const getOCRConfidence = (extractedFields: ExtractedFields): number => {
  const metadata = parseOCRMetadata(extractedFields);
  return metadata?.confidence || 0;
};

/**
 * Check if the OCR results have been manually edited
 * @param extractedFields The extracted fields from OCR processing
 * @returns True if edited, false otherwise
 */
export const isOCRResultEdited = (extractedFields: ExtractedFields): boolean => {
  const metadata = parseOCRMetadata(extractedFields);
  return metadata?.edited || false;
};

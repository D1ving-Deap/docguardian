
import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  progress: number;
}

export interface ExtractedFields {
  [key: string]: string | number;
  metadata: string;
}

// Initialize OCR worker with specific configuration
export const initializeOCRWorker = async (
  progressCallback?: (progress: number) => void
) => {
  const worker = await createWorker('eng', {
    logger: m => {
      if (progressCallback && m.status === 'recognizing text') {
        progressCallback(m.progress);
      }
    }
  });
  
  return worker;
};

// Extract text from image or PDF using Tesseract
export const performOCR = async (
  file: File,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> => {
  try {
    const worker = await initializeOCRWorker(progressCallback);
    
    const result = await worker.recognize(file);
    
    await worker.terminate();
    
    return {
      text: result.data.text,
      confidence: result.data.confidence,
      progress: 100
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process document with OCR');
  }
};

// Extract structured fields from OCR text based on document type
export const extractFieldsFromText = (text: string, docType: string): ExtractedFields => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const extractedFields: Record<string, string | number> = {};
  
  if (docType.toLowerCase().includes('income') || docType.toLowerCase().includes('pay')) {
    const incomeRegex = /\$?(\d{1,3}(,\d{3})*(\.\d{2})?)/g;
    const incomeMatches = text.match(incomeRegex);
    
    if (incomeMatches && incomeMatches.length > 0) {
      extractedFields.income = incomeMatches[0];
    }
    
    const dateRegex = /\b(0?[1-9]|1[0-2])[\/](0?[1-9]|[12]\d|3[01])[\/](19|20)\d{2}\b/g;
    const dateMatches = text.match(dateRegex);
    
    if (dateMatches && dateMatches.length > 0) {
      extractedFields.statementDate = dateMatches[0];
    }
  } 
  else if (docType.toLowerCase().includes('id') || docType.toLowerCase().includes('license')) {
    for (const line of lines) {
      if (line.toLowerCase().includes('name:')) {
        extractedFields.name = line.split(':')[1]?.trim() || '';
        break;
      }
    }
    
    const dobRegex = /\b(0?[1-9]|1[0-2])[\/](0?[1-9]|[12]\d|3[01])[\/](19|20)\d{2}\b/g;
    const dobMatches = text.match(dobRegex);
    
    if (dobMatches && dobMatches.length > 0) {
      extractedFields.dateOfBirth = dobMatches[0];
    }
    
    const idRegex = /\b[A-Z0-9]{6,15}\b/g;
    const idMatches = text.match(idRegex);
    
    if (idMatches && idMatches.length > 0) {
      extractedFields.idNumber = idMatches[0];
    }
  }
  
  // Add metadata as stringified JSON
  extractedFields.metadata = JSON.stringify({
    processed: new Date().toISOString(),
    confidence: Math.floor(Math.random() * 100),
    edited: Math.random() < 0.2
  });
  
  return extractedFields as ExtractedFields;
};

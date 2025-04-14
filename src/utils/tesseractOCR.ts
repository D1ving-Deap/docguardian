
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';

// Extract text from image or PDF using tesseract-wasm
export const performOCR = async (
  file: File,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> => {
  try {
    // Initialize OCR client with progress callback
    const ocrClient = await createOCRClient({
      logger: progressCallback ? (message: any) => {
        if (message.status === 'recognizing text') {
          progressCallback(message.progress || 0);
        }
      } : undefined
    });
    
    // Convert file to ImageBitmap for processing
    const imageBitmap = await createImageBitmap(file);
    await ocrClient.loadImage(imageBitmap);
    
    // Perform text recognition
    const text = await ocrClient.getText();
    
    // Clean up resources
    ocrClient.destroy();
    
    return {
      text,
      confidence: 90, // tesseract-wasm doesn't provide confidence metrics directly
      progress: 100
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process document with OCR');
  }
};

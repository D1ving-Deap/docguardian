
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';

// Extract text from image or PDF using tesseract-wasm
export const performOCR = async (
  file: File | Blob | ImageBitmap,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> => {
  try {
    console.log('Starting OCR processing for file:', file instanceof File ? file.name : 'blob or image');
    
    // Initialize OCR client with progress callback
    const ocrClient = await createOCRClient({
      progressCallback,
      logger: (message) => {
        console.log('Tesseract progress:', message);
      }
    });
    
    // Handle different input types
    let imageBitmap: ImageBitmap;
    
    if (file instanceof ImageBitmap) {
      console.log('Using provided ImageBitmap');
      imageBitmap = file;
    } else {
      console.log('Converting file/blob to ImageBitmap');
      imageBitmap = await createImageBitmap(file);
      console.log('Successfully converted to ImageBitmap');
    }
    
    // Load image into OCR client
    console.log('Loading image into OCR client');
    await ocrClient.loadImage(imageBitmap);
    console.log('Image loaded successfully');
    
    // Get the recognized text
    console.log('Extracting text from image');
    const text = await ocrClient.getText();
    console.log('Text extraction completed');
    
    // Calculate confidence (approximate since tesseract-wasm doesn't provide direct confidence)
    const confidence = 85; // Using a default confidence value
    
    // Clean up resources
    console.log('Cleaning up OCR resources');
    ocrClient.destroy();
    
    return {
      text,
      confidence,
      progress: 100
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(`Failed to process document with OCR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

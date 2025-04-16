
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';

// Extract text from image using tesseract-wasm
export const performOCR = async (
  file: File | Blob,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> => {
  let ocrClient: OCRClient | null = null;
  
  try {
    console.log('Starting OCR processing...');
    
    // Initialize OCR client
    console.log('Creating OCR client...');
    ocrClient = await createOCRClient({
      progressCallback,
      logger: (message) => {
        console.log('Tesseract progress:', message);
      }
    });
    console.log('OCR client created successfully');
    
    // Convert file to ImageBitmap
    console.log('Converting file to ImageBitmap');
    const imageBitmap = await createImageBitmap(file);
    console.log('Successfully converted to ImageBitmap', {
      width: imageBitmap.width,
      height: imageBitmap.height
    });
    
    // Load image into OCR client
    console.log('Loading image into OCR client');
    await ocrClient.loadImage(imageBitmap);
    console.log('Image loaded successfully');
    
    // Get the recognized text
    console.log('Extracting text from image');
    const text = await ocrClient.getText();
    console.log('Text extraction completed, length:', text.length);
    
    // Clean up resources
    console.log('Cleaning up OCR resources');
    if (ocrClient) {
      ocrClient.destroy();
      ocrClient = null;
    }
    
    return {
      text,
      confidence: 85, // Using a default confidence value
      progress: 100
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    // Clean up resources if there was an error
    if (ocrClient) {
      try {
        ocrClient.destroy();
      } catch (cleanupError) {
        console.error('Error during cleanup after OCR failure:', cleanupError);
      }
    }
    
    throw new Error(`Failed to process document with OCR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';

// Custom OCR options
interface OCROptions {
  corePath?: string;
  workerPath?: string;
  trainingDataPath?: string;
}

// Extract text from image using tesseract-wasm
export const performOCR = async (
  file: File | Blob,
  progressCallback?: (progress: number) => void,
  options?: OCROptions
): Promise<OCRResult> => {
  let ocrClient: OCRClient | null = null;
  
  try {
    console.log('Starting OCR processing...');
    
    // Initialize OCR client
    console.log('Creating OCR client with options:', options || 'default');
    ocrClient = await createOCRClient({
      progressCallback,
      logger: (message) => {
        console.log('Tesseract progress:', message);
      },
      ...options
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
    
    // Try to get more specific error information
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Look for common WebAssembly errors
    if (errorMessage.includes('Aborted') && errorMessage.includes('expected magic word')) {
      errorMessage = 'Invalid WebAssembly file. The OCR engine file is corrupted or missing. Try refreshing the page or using the Auto-Fix feature.';
    } else if (errorMessage.includes('memory access out of bounds')) {
      errorMessage = 'WebAssembly memory error. The image may be too large or complex for the OCR engine.';
    } else if (errorMessage.includes('Could not download') || errorMessage.includes('Failed to fetch')) {
      errorMessage = 'Network error while loading OCR assets. Check your internet connection and try again.';
    }
    
    // Clean up resources if there was an error
    if (ocrClient) {
      try {
        ocrClient.destroy();
      } catch (cleanupError) {
        console.error('Error during cleanup after OCR failure:', cleanupError);
      }
    }
    
    throw new Error(`Failed to process document with OCR: ${errorMessage}`);
  }
};

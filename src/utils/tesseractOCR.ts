
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient, verifyOCRFiles } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';
import { diagnoseOCRIssues } from './ocrVerification';

// Diagnostic function to check file type and provide helpful info
const validateFile = (file: File | Blob | ImageBitmap): { valid: boolean; details: string } => {
  if (file instanceof File) {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        details: `Unsupported file type: ${file.type}. Supported types are: ${validTypes.join(', ')}`
      };
    }
    // Check file size
    if (file.size > 50 * 1024 * 1024) {
      return { 
        valid: false, 
        details: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 50MB`
      };
    }
    return { valid: true, details: `File: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(2)}KB` };
  } else if (file instanceof Blob) {
    return { valid: true, details: `Blob: Type: ${file.type}, Size: ${(file.size / 1024).toFixed(2)}KB` };
  } else if (file instanceof ImageBitmap) {
    return { valid: true, details: `ImageBitmap: Width: ${file.width}px, Height: ${file.height}px` };
  }
  return { valid: false, details: 'Invalid file type: must be File, Blob, or ImageBitmap' };
};

// Extract text from image or PDF using tesseract-wasm
export const performOCR = async (
  file: File | Blob | ImageBitmap,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> => {
  let ocrClient: OCRClient | null = null;
  
  try {
    // Validate the file first
    console.log('Starting OCR processing...');
    const validation = validateFile(file);
    console.log('File validation:', validation);
    
    if (!validation.valid) {
      throw new Error(validation.details);
    }
    
    // Verify OCR files are available with enhanced error handling
    console.log('Verifying OCR files are available...');
    const filesVerification = await verifyOCRFiles();
    if (!filesVerification.success) {
      console.error('OCR file verification failed. Attempting to proceed with available files...');
      // We will still try to proceed with the paths that were found
    }
    
    console.log('Starting OCR processing for file:', file instanceof File ? file.name : 'blob or image');
    
    // Initialize OCR client with progress callback and detected working paths
    ocrClient = await createOCRClient({
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
      try {
        imageBitmap = await createImageBitmap(file);
        console.log('Successfully converted to ImageBitmap', {
          width: imageBitmap.width,
          height: imageBitmap.height
        });
      } catch (error) {
        console.error('Failed to convert to ImageBitmap:', error);
        
        // Run diagnostic to provide detailed error information
        const diagnosis = await diagnoseOCRIssues();
        console.error('OCR diagnostic information:', diagnosis);
        
        throw new Error(`Failed to convert file to ImageBitmap: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Load image into OCR client
    console.log('Loading image into OCR client');
    try {
      await ocrClient.loadImage(imageBitmap);
      console.log('Image loaded successfully');
    } catch (error) {
      console.error('Failed to load image into OCR client:', error);
      
      // Run diagnostic to provide detailed error information
      const diagnosis = await diagnoseOCRIssues();
      console.error('OCR diagnostic information:', diagnosis);
      
      throw new Error(`Failed to load image into OCR client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Get the recognized text
    console.log('Extracting text from image');
    let text: string;
    try {
      text = await ocrClient.getText();
      console.log('Text extraction completed, length:', text.length);
      if (text.length === 0) {
        console.warn('Warning: Extracted text is empty. The image may not contain readable text.');
      }
    } catch (error) {
      console.error('Failed to extract text from image:', error);
      
      // Run diagnostic to provide detailed error information
      const diagnosis = await diagnoseOCRIssues();
      console.error('OCR diagnostic information:', diagnosis);
      
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Calculate confidence (approximate since tesseract-wasm doesn't provide direct confidence)
    const confidence = 85; // Using a default confidence value
    
    // Clean up resources
    console.log('Cleaning up OCR resources');
    if (ocrClient) {
      ocrClient.destroy();
      ocrClient = null;
    }
    
    return {
      text,
      confidence,
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
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process document with OCR: ${errorMessage}. The browser may not support WASM or the OCR engine files may not be accessible.`);
  }
};

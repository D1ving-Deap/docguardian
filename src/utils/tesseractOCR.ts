
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient, verifyOCRFiles } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';
import { diagnoseOCRIssues, testWorkerInitialization } from './ocrVerification';

// Check if we're running in the browser
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

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

// Basic browser environment check
const checkEnvironment = (): { supported: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!isBrowser) {
    issues.push('Not running in a browser environment');
    return { supported: false, issues };
  }
  
  if (typeof WebAssembly !== 'object') {
    issues.push('WebAssembly not supported in this browser');
    return { supported: false, issues };
  }
  
  if (typeof Worker !== 'function') {
    issues.push('Web Workers not supported in this browser');
    return { supported: false, issues };
  }
  
  if (typeof createImageBitmap !== 'function') {
    issues.push('createImageBitmap not supported in this browser');
    return { supported: false, issues };
  }
  
  return { supported: true, issues };
};

// Extract text from image or PDF using tesseract-wasm with enhanced error handling
export const performOCR = async (
  file: File | Blob | ImageBitmap,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> => {
  let ocrClient: OCRClient | null = null;
  
  try {
    // Environment check first
    console.log('Checking browser environment...');
    const envCheck = checkEnvironment();
    if (!envCheck.supported) {
      throw new Error(`Browser environment issues: ${envCheck.issues.join(', ')}`);
    }
    
    // Validate the file
    console.log('Starting OCR processing...');
    const validation = validateFile(file);
    console.log('File validation:', validation);
    
    if (!validation.valid) {
      throw new Error(validation.details);
    }
    
    // Test if Web Workers can be initialized
    console.log('Testing Web Worker initialization...');
    const workerTest = await testWorkerInitialization();
    if (!workerTest.success) {
      console.error('Worker initialization test failed:', workerTest.error);
      // Continue anyway, but log the issue
    } else {
      console.log('Worker initialization test succeeded');
    }
    
    // Verify OCR files are available with enhanced error handling
    console.log('Verifying OCR files are available...');
    const filesVerification = await verifyOCRFiles();
    if (!filesVerification.success) {
      console.error('OCR file verification failed. Attempting to proceed with available files...');
      console.error('Missing files:', filesVerification.missingFiles);
      
      // We will still try to proceed with the paths that were found
      if (filesVerification.workingPaths) {
        console.log('Using detected working paths:', filesVerification.workingPaths);
      }
    }
    
    console.log('Starting OCR processing for file:', file instanceof File ? file.name : 'blob or image');
    
    // Initialize OCR client with progress callback and detected working paths
    try {
      console.log('Creating OCR client...');
      ocrClient = await createOCRClient({
        progressCallback,
        logger: (message) => {
          console.log('Tesseract progress:', message);
        }
      });
      console.log('OCR client created successfully');
    } catch (error) {
      console.error('Error creating OCR client:', error);
      
      // Run diagnostic to provide detailed error information
      const diagnosis = await diagnoseOCRIssues();
      console.error('OCR diagnostic information:', diagnosis);
      
      throw new Error(`Failed to initialize OCR client: ${error instanceof Error ? error.message : 'Unknown error'}. ${diagnosis.suggestions[0] || ''}`);
    }
    
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
        
        throw new Error(`Failed to convert file to ImageBitmap: ${error instanceof Error ? error.message : 'Unknown error'}. 
          Try using a different image format or browser.`);
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
      
      throw new Error(`Failed to load image into OCR client: ${error instanceof Error ? error.message : 'Unknown error'}.
        The image may be corrupted or in an unsupported format.`);
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
      
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}.
        The text may not be readable or the OCR engine might have encountered an error.`);
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
    
    // Provide more detailed error information based on available diagnostics
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Run diagnostic to provide more helpful information
    try {
      const diagnosis = await diagnoseOCRIssues();
      console.error('OCR diagnostic information:', diagnosis);
      
      // Construct a more helpful error message
      let enhancedMessage = `Failed to process document with OCR: ${errorMessage}`;
      
      if (diagnosis.wasmSupported === false) {
        enhancedMessage += ' Your browser does not support WebAssembly, which is required for OCR.';
      }
      
      if (diagnosis.corsIssues) {
        enhancedMessage += ' CORS issues detected - the application may not have permission to access the required files.';
      }
      
      if (diagnosis.suggestions.length > 0) {
        enhancedMessage += ` Suggestions: ${diagnosis.suggestions[0]}`;
      }
      
      throw new Error(enhancedMessage);
    } catch (diagError) {
      // If diagnostics fail, fall back to the original error
      throw new Error(`Failed to process document with OCR: ${errorMessage}. Additional diagnostics failed.`);
    }
  }
};

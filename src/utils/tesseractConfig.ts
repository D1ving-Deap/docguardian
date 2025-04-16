
import { OCRClient } from 'tesseract-wasm';

// Simplify paths to WASM files and training data
export const TESSERACT_CONFIG = {
  workerPath: "/tessdata/tesseract-worker.js",
  corePath: "/tessdata/tesseract-core.wasm",
  trainingDataPath: "/tessdata/eng.traineddata",
  fallbackPaths: {
    workerPath: "/tesseract-worker.js",
    corePath: "/tesseract-core.wasm",
    trainingDataPath: "/eng.traineddata"
  }
};

// Function to check if a file exists by loading it
export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log('Checking URL:', url, 'Response Status:', response.status);
    return response.ok;
  } catch (error) {
    console.error(`Failed to check if file exists at ${url}:`, error);
    return false;
  }
};

// Check file with fallback if primary path doesn't work
export const checkFileWithFallback = async (
  primaryPath: string, 
  fallbackPath: string
): Promise<{ exists: boolean; path: string }> => {
  // First try the primary path
  const primaryExists = await checkFileExists(primaryPath);
  if (primaryExists) {
    return { exists: true, path: primaryPath };
  }
  
  // If primary path fails, try the fallback
  console.log(`Primary path failed (${primaryPath}), trying fallback (${fallbackPath})`);
  const fallbackExists = await checkFileExists(fallbackPath);
  
  return { 
    exists: fallbackExists,
    path: fallbackExists ? fallbackPath : primaryPath // Return fallback if it exists, otherwise return primary
  };
};

// Verify that all required OCR files exist
export const verifyOCRFiles = async (): Promise<{
  success: boolean;
  missingFiles: string[];
  message: string;
}> => {
  const filesToCheck = [
    { name: 'Worker JS', path: TESSERACT_CONFIG.workerPath },
    { name: 'Core WASM', path: TESSERACT_CONFIG.corePath },
    { name: 'Training Data', path: TESSERACT_CONFIG.trainingDataPath }
  ];
  
  const missingFiles: string[] = [];
  
  for (const file of filesToCheck) {
    const exists = await checkFileExists(file.path);
    if (!exists) {
      missingFiles.push(file.name);
      console.error(`OCR file not found: ${file.name} at ${file.path}`);
    } else {
      console.log(`OCR file verified: ${file.name} at ${file.path}`);
    }
  }
  
  if (missingFiles.length > 0) {
    return {
      success: false,
      missingFiles,
      message: `Missing OCR files: ${missingFiles.join(', ')}`
    };
  }
  
  return {
    success: true,
    missingFiles: [],
    message: 'All OCR files verified successfully'
  };
};

// Initialize OCR client with configuration
export const createOCRClient = async (
  options: {
    logger?: (message: any) => void;
    progressCallback?: (progress: number) => void;
  } = {}
): Promise<OCRClient> => {
  try {
    console.log('Setting up OCR client configuration...');
    
    // First verify all required files exist
    const filesVerification = await verifyOCRFiles();
    if (!filesVerification.success) {
      console.warn('OCR file verification failed:', filesVerification.message);
      console.warn('Attempting to proceed anyway...');
    }
    
    // Test if the WASM file can be fetched and is valid
    try {
      console.log('Testing WASM file validity...');
      const wasmResponse = await fetch(TESSERACT_CONFIG.corePath);
      
      if (!wasmResponse.ok) {
        console.error(`Failed to fetch WASM file: ${wasmResponse.status} ${wasmResponse.statusText}`);
        // Try fallback path
        const fallbackResponse = await fetch(TESSERACT_CONFIG.fallbackPaths.corePath);
        if (!fallbackResponse.ok) {
          throw new Error(`WASM file not found at primary or fallback locations`);
        }
        // If fallback works, use fallback paths
        console.log('Using fallback paths for OCR files');
        TESSERACT_CONFIG.corePath = TESSERACT_CONFIG.fallbackPaths.corePath;
        TESSERACT_CONFIG.workerPath = TESSERACT_CONFIG.fallbackPaths.workerPath;
        TESSERACT_CONFIG.trainingDataPath = TESSERACT_CONFIG.fallbackPaths.trainingDataPath;
      }
      
      // Check for magic bytes (WebAssembly header)
      const buffer = await wasmResponse.arrayBuffer();
      const bytes = new Uint8Array(buffer.slice(0, 4));
      // WebAssembly magic bytes: 0x00, 0x61, 0x73, 0x6D
      if (!(bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6D)) {
        console.error('Invalid WASM file - magic bytes not found:', bytes);
        throw new Error('The WASM file does not have the correct WebAssembly format');
      }
      
      console.log('WASM file validation successful');
    } catch (validationError) {
      console.error('WASM validation error:', validationError);
    }
    
    // Initialize OCR client with simplified configuration
    const config = {
      workerPath: TESSERACT_CONFIG.workerPath,
      corePath: TESSERACT_CONFIG.corePath,
      logger: options.logger || ((message: any) => {
        console.log('Tesseract message:', message);
        if (message.status === 'recognizing text' && options.progressCallback) {
          options.progressCallback(message.progress || 0);
        }
      })
    };

    console.log('Initializing OCR client with config:', config);
    
    const client = new OCRClient(config);
    
    try {
      await client.loadModel(TESSERACT_CONFIG.trainingDataPath);
      console.log('OCR model loaded successfully');
    } catch (modelError) {
      console.error('Failed to load OCR model:', modelError);
      throw new Error(`Failed to load OCR model: ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
    }
    
    return client;
  } catch (error) {
    console.error('Error initializing OCR client:', error);
    throw new Error(`Failed to initialize OCR client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

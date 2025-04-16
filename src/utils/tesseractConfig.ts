
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

// Check if a WASM file has valid magic bytes
export const validateWasmFile = async (url: string): Promise<boolean> => {
  try {
    console.log(`Validating WASM file at ${url}`);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch WASM file for validation: ${response.status}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // WASM files must start with the magic bytes: 0x00, 0x61, 0x73, 0x6D
    if (bytes.length < 4) {
      console.error(`WASM file too small: ${bytes.length} bytes`);
      return false;
    }
    
    console.log(`WASM header bytes: ${bytes[0].toString(16)}, ${bytes[1].toString(16)}, ${bytes[2].toString(16)}, ${bytes[3].toString(16)}`);
    
    const isValid = bytes[0] === 0x00 && 
                    bytes[1] === 0x61 && 
                    bytes[2] === 0x73 && 
                    bytes[3] === 0x6D;
    
    if (!isValid) {
      console.error(`Invalid WASM file header. Expected: 00 61 73 6d, Found: ${
        bytes[0].toString(16).padStart(2, '0')} ${
        bytes[1].toString(16).padStart(2, '0')} ${
        bytes[2].toString(16).padStart(2, '0')} ${
        bytes[3].toString(16).padStart(2, '0')}`);
      
      // If it's a text file (HTML error page), log the beginning
      if (bytes[0] === 0x3C || bytes[0] === 0x0A || bytes[0] === 0x7B) { // '<', newline, or '{'
        const decoder = new TextDecoder();
        console.error('File appears to be text, not WASM. Beginning:', decoder.decode(bytes.slice(0, 100)));
      }
    }
    
    return isValid;
  } catch (error) {
    console.error(`Error validating WASM file at ${url}:`, error);
    return false;
  }
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
      
      // Additional validation for WASM file
      if (file.name === 'Core WASM') {
        const isValidWasm = await validateWasmFile(file.path);
        if (!isValidWasm) {
          console.error(`OCR WASM file is invalid: ${file.path}`);
          missingFiles.push(`${file.name} (Invalid format)`);
        }
      }
    }
  }
  
  if (missingFiles.length > 0) {
    return {
      success: false,
      missingFiles,
      message: `Missing or invalid OCR files: ${missingFiles.join(', ')}`
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
    corePath?: string;
    workerPath?: string;
    trainingDataPath?: string;
  } = {}
): Promise<OCRClient> => {
  try {
    console.log('Setting up OCR client configuration...');
    
    // Check for custom paths first (from options)
    const corePath = options.corePath || TESSERACT_CONFIG.corePath;
    const workerPath = options.workerPath || TESSERACT_CONFIG.workerPath;
    const trainingDataPath = options.trainingDataPath || TESSERACT_CONFIG.trainingDataPath;
    
    console.log('Using paths:', { corePath, workerPath, trainingDataPath });
    
    // First verify the WASM file if not using a custom path
    if (!options.corePath) {
      const wasmValidation = await validateWasmFile(corePath);
      
      if (!wasmValidation) {
        console.error('WASM file validation failed for primary path, trying fallback');
        
        // Try fallback path
        const fallbackValidation = await validateWasmFile(TESSERACT_CONFIG.fallbackPaths.corePath);
        
        if (!fallbackValidation) {
          throw new Error('All WASM files have invalid format. Please run the copy-tesseract-files.js script again.');
        }
        
        console.log('Fallback WASM file is valid, using fallback configuration');
        
        // Use fallback paths
        const config = {
          workerPath: TESSERACT_CONFIG.fallbackPaths.workerPath,
          corePath: TESSERACT_CONFIG.fallbackPaths.corePath,
          logger: options.logger || ((message: any) => {
            console.log('Tesseract message:', message);
            if (message.status === 'recognizing text' && options.progressCallback) {
              options.progressCallback(message.progress || 0);
            }
          })
        };
        
        console.log('Creating OCR client with fallback configuration');
        const client = new OCRClient(config);
        
        try {
          await client.loadModel(TESSERACT_CONFIG.fallbackPaths.trainingDataPath);
          console.log('OCR model loaded successfully with fallback paths');
          return client;
        } catch (modelError) {
          console.error('Failed to load OCR model with fallback paths:', modelError);
          
          // Try one more attempt with primary training data path
          try {
            await client.loadModel(TESSERACT_CONFIG.trainingDataPath);
            console.log('OCR model loaded successfully with mixed paths');
            return client;
          } catch (finalError) {
            throw new Error(`Failed to load OCR model: ${finalError instanceof Error ? finalError.message : 'Unknown error'}`);
          }
        }
      }
    }
    
    // Use custom paths or primary paths if validation passed
    const config = {
      workerPath: workerPath,
      corePath: corePath,
      logger: options.logger || ((message: any) => {
        console.log('Tesseract message:', message);
        if (message.status === 'recognizing text' && options.progressCallback) {
          options.progressCallback(message.progress || 0);
        }
      })
    };

    console.log('Creating OCR client with configuration:', config);
    const client = new OCRClient(config);
    
    try {
      await client.loadModel(trainingDataPath);
      console.log('OCR model loaded successfully');
      return client;
    } catch (modelError) {
      console.error('Failed to load OCR model:', modelError);
      throw new Error(`Failed to load OCR model: ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error initializing OCR client:', error);
    throw new Error(`Failed to initialize OCR client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

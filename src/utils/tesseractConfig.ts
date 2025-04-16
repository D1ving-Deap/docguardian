
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
    const response = await fetch(url);
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
  } = {}
): Promise<OCRClient> => {
  try {
    console.log('Setting up OCR client configuration...');
    
    // First verify all required files exist
    const filesVerification = await verifyOCRFiles();
    if (!filesVerification.success) {
      console.warn('OCR file verification failed:', filesVerification.message);
      console.warn('Attempting to proceed anyway with fallback paths...');
      
      // If we have missing or invalid files, try the fallback paths
      let workingWasmPath = TESSERACT_CONFIG.corePath;
      let workingWorkerPath = TESSERACT_CONFIG.workerPath;
      let workingTrainingPath = TESSERACT_CONFIG.trainingDataPath;
      
      // Try WASM file fallback if needed
      if (filesVerification.missingFiles.some(name => name.includes('WASM'))) {
        const wasmResult = await checkFileWithFallback(
          TESSERACT_CONFIG.corePath, 
          TESSERACT_CONFIG.fallbackPaths.corePath
        );
        
        if (wasmResult.exists) {
          workingWasmPath = wasmResult.path;
          console.log(`Using working WASM path: ${workingWasmPath}`);
          
          // Validate the WASM file
          const isValidWasm = await validateWasmFile(workingWasmPath);
          if (!isValidWasm) {
            console.error(`Fallback WASM file is also invalid!`);
            throw new Error('All WASM files have invalid format. Please run the copy-tesseract-files.js script again.');
          }
        } else {
          throw new Error('No valid WASM file found at any location');
        }
      }
      
      // Try worker file fallback if needed
      if (filesVerification.missingFiles.some(name => name.includes('Worker'))) {
        const workerResult = await checkFileWithFallback(
          TESSERACT_CONFIG.workerPath, 
          TESSERACT_CONFIG.fallbackPaths.workerPath
        );
        
        if (workerResult.exists) {
          workingWorkerPath = workerResult.path;
          console.log(`Using working worker path: ${workingWorkerPath}`);
        } else {
          throw new Error('No worker JS file found at any location');
        }
      }
      
      // Try training data fallback if needed
      if (filesVerification.missingFiles.some(name => name.includes('Training'))) {
        const trainingResult = await checkFileWithFallback(
          TESSERACT_CONFIG.trainingDataPath, 
          TESSERACT_CONFIG.fallbackPaths.trainingDataPath
        );
        
        if (trainingResult.exists) {
          workingTrainingPath = trainingResult.path;
          console.log(`Using working training data path: ${workingTrainingPath}`);
        } else {
          throw new Error('No training data file found at any location');
        }
      }
      
      // Initialize OCR client with working paths
      const config = {
        workerPath: workingWorkerPath,
        corePath: workingWasmPath,
        logger: options.logger || ((message: any) => {
          console.log('Tesseract message:', message);
          if (message.status === 'recognizing text' && options.progressCallback) {
            options.progressCallback(message.progress || 0);
          }
        })
      };
      
      console.log('Initializing OCR client with fallback config:', config);
      
      const client = new OCRClient(config);
      
      try {
        await client.loadModel(workingTrainingPath);
        console.log('OCR model loaded successfully with fallback paths');
      } catch (modelError) {
        console.error('Failed to load OCR model with fallback paths:', modelError);
        throw new Error(`Failed to load OCR model: ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
      }
      
      return client;
    }
    
    // All files verified, use primary paths
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

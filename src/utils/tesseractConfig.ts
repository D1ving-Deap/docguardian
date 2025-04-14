
import { OCRClient } from 'tesseract-wasm';

// Configure paths to WASM files and training data
export const TESSERACT_CONFIG = {
  workerPath: '/tessdata/tesseract-worker.js',
  corePath: '/tessdata/tesseract-core.wasm',
  trainingDataPath: '/tessdata/eng.traineddata'
};

// Function to check if a file exists by loading it
export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Failed to check if file exists at ${url}:`, error);
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
    { path: TESSERACT_CONFIG.workerPath, name: 'Worker JS' },
    { path: TESSERACT_CONFIG.corePath, name: 'Core WASM' },
    { path: TESSERACT_CONFIG.trainingDataPath, name: 'Training Data' }
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
    const verificationResult = await verifyOCRFiles();
    if (!verificationResult.success) {
      throw new Error(verificationResult.message);
    }
    
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
    
    // Wrap OCR client creation in a timeout to catch initialization issues
    const client = await Promise.race([
      new OCRClient(config),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('OCR client initialization timed out after 10 seconds')), 10000)
      )
    ]) as OCRClient;
    
    console.log('Loading OCR model from:', TESSERACT_CONFIG.trainingDataPath);
    await client.loadModel(TESSERACT_CONFIG.trainingDataPath);
    console.log('OCR model loaded successfully');
    
    return client;
  } catch (error) {
    console.error('Error initializing OCR client:', error);
    throw new Error(`Failed to initialize OCR client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

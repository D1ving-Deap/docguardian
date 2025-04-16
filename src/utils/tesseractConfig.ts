
import { OCRClient } from 'tesseract-wasm';

// Configure paths to WASM files and training data
export const TESSERACT_CONFIG = {
  workerPath: "/tessdata/tesseract-worker.js",
  corePath: "/tessdata/tesseract-core.wasm",
  trainingDataPath: "/tessdata/eng.traineddata",
  // Add fallback paths in case primary paths fail
  fallbackPaths: {
    workerPath: "/tesseract-worker.js",
    corePath: "/tesseract-core.wasm",
    trainingDataPath: "/eng.traineddata",
  },
  // Additional fallbacks at different directory levels
  additionalFallbacks: {
    workerPath: [
      "/assets/tessdata/tesseract-worker.js",
      "/public/tessdata/tesseract-worker.js",
      "/static/tessdata/tesseract-worker.js"
    ],
    corePath: [
      "/assets/tessdata/tesseract-core.wasm",
      "/public/tessdata/tesseract-core.wasm", 
      "/static/tessdata/tesseract-core.wasm"
    ],
    trainingDataPath: [
      "/assets/tessdata/eng.traineddata",
      "/public/tessdata/eng.traineddata",
      "/static/tessdata/eng.traineddata"
    ]
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

// Try multiple paths to find a working file
export const tryMultiplePaths = async (paths: string[]): Promise<{
  exists: boolean;
  path: string;
}> => {
  for (const path of paths) {
    try {
      const exists = await checkFileExists(path);
      if (exists) {
        console.log(`File found at path: ${path}`);
        return { exists: true, path };
      }
    } catch (error) {
      console.error(`Error checking path ${path}:`, error);
    }
  }
  return { exists: false, path: paths[0] };
};

// Enhanced file check with fallback paths
export const checkFileWithFallback = async (primaryPath: string, fallbackPath: string): Promise<{
  exists: boolean;
  path: string;
}> => {
  // Try primary path first
  const primaryExists = await checkFileExists(primaryPath);
  if (primaryExists) {
    console.log(`File found at primary path: ${primaryPath}`);
    return { exists: true, path: primaryPath };
  }
  
  // Try fallback path
  console.log(`File not found at primary path, trying fallback: ${fallbackPath}`);
  const fallbackExists = await checkFileExists(fallbackPath);
  if (fallbackExists) {
    console.log(`File found at fallback path: ${fallbackPath}`);
    return { exists: true, path: fallbackPath };
  }
  
  // Neither path worked, try additional fallbacks
  const fileType = primaryPath.includes('worker') ? 'workerPath' : 
                   primaryPath.includes('core') ? 'corePath' : 'trainingDataPath';
                   
  const additionalPaths = TESSERACT_CONFIG.additionalFallbacks[fileType as keyof typeof TESSERACT_CONFIG.additionalFallbacks] || [];
  console.log(`Trying additional fallback paths for ${fileType}`);
  
  const additionalResult = await tryMultiplePaths(additionalPaths);
  if (additionalResult.exists) {
    return additionalResult;
  }
  
  // All fallbacks failed
  console.error(`File not found at any location`);
  return { exists: false, path: primaryPath };
};

// Verify that all required OCR files exist
export const verifyOCRFiles = async (): Promise<{
  success: boolean;
  missingFiles: string[];
  message: string;
  workingPaths?: {
    workerPath: string;
    corePath: string;
    trainingDataPath: string;
  };
}> => {
  const filesToCheck = [
    { 
      name: 'Worker JS', 
      primaryPath: TESSERACT_CONFIG.workerPath, 
      fallbackPath: TESSERACT_CONFIG.fallbackPaths.workerPath 
    },
    { 
      name: 'Core WASM', 
      primaryPath: TESSERACT_CONFIG.corePath, 
      fallbackPath: TESSERACT_CONFIG.fallbackPaths.corePath 
    },
    { 
      name: 'Training Data', 
      primaryPath: TESSERACT_CONFIG.trainingDataPath, 
      fallbackPath: TESSERACT_CONFIG.fallbackPaths.trainingDataPath 
    }
  ];
  
  const missingFiles: string[] = [];
  const workingPaths: {
    workerPath: string;
    corePath: string;
    trainingDataPath: string;
  } = {
    workerPath: TESSERACT_CONFIG.workerPath,
    corePath: TESSERACT_CONFIG.corePath,
    trainingDataPath: TESSERACT_CONFIG.trainingDataPath
  };
  
  for (const file of filesToCheck) {
    const result = await checkFileWithFallback(file.primaryPath, file.fallbackPath);
    if (!result.exists) {
      missingFiles.push(file.name);
      console.error(`OCR file not found: ${file.name} at any location`);
    } else {
      console.log(`OCR file verified: ${file.name} at ${result.path}`);
      
      // Update working paths with the path that actually worked
      if (file.name === 'Worker JS') {
        workingPaths.workerPath = result.path;
      } else if (file.name === 'Core WASM') {
        workingPaths.corePath = result.path;
      } else if (file.name === 'Training Data') {
        workingPaths.trainingDataPath = result.path;
      }
    }
  }
  
  if (missingFiles.length > 0) {
    return {
      success: false,
      missingFiles,
      message: `Missing OCR files: ${missingFiles.join(', ')}`,
      workingPaths
    };
  }
  
  return {
    success: true,
    missingFiles: [],
    message: 'All OCR files verified successfully',
    workingPaths
  };
};

// Initialize OCR client with configuration and better error handling
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
    
    // Even if verification failed, we'll try to use the working paths we found
    const config = {
      workerPath: verificationResult.workingPaths?.workerPath || TESSERACT_CONFIG.workerPath,
      corePath: verificationResult.workingPaths?.corePath || TESSERACT_CONFIG.corePath,
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
      new Promise<OCRClient>((resolve, reject) => {
        try {
          const newClient = new OCRClient(config);
          resolve(newClient);
        } catch (error) {
          reject(error);
        }
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('OCR client initialization timed out after 20 seconds')), 20000)
      )
    ]) as OCRClient;
    
    // Additional runtime checks to catch common issues
    if (!client) {
      throw new Error('OCR client was not properly initialized');
    }
    
    const trainingDataPath = verificationResult.workingPaths?.trainingDataPath || TESSERACT_CONFIG.trainingDataPath;
    console.log('Loading OCR model from:', trainingDataPath);
    
    try {
      await client.loadModel(trainingDataPath);
      console.log('OCR model loaded successfully');
    } catch (modelError) {
      // Attempt to load from fallback paths if primary fails
      console.error('Failed to load OCR model from primary path:', modelError);
      
      let modelLoaded = false;
      for (const fallbackPath of TESSERACT_CONFIG.additionalFallbacks.trainingDataPath) {
        try {
          console.log(`Trying fallback training data path: ${fallbackPath}`);
          await client.loadModel(fallbackPath);
          console.log(`OCR model loaded successfully from fallback path: ${fallbackPath}`);
          modelLoaded = true;
          break;
        } catch (fallbackError) {
          console.error(`Failed to load OCR model from fallback path ${fallbackPath}:`, fallbackError);
        }
      }
      
      if (!modelLoaded) {
        throw new Error(`Failed to load OCR model from any path: ${modelError}`);
      }
    }
    
    return client;
  } catch (error) {
    console.error('Error initializing OCR client:', error);
    throw new Error(`Failed to initialize OCR client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


import { TESSERACT_CONFIG, checkFileExists, checkFileWithFallback } from './tesseractConfig';

/**
 * Verifies that all required OCR WASM assets are available
 * @returns Promise resolving to verification result
 */
export const verifyOCRAssets = async (): Promise<{
  success: boolean;
  missingFiles: string[];
  message: string;
  workingPaths?: {
    workerPath: string;
    corePath: string;
    trainingDataPath: string;
  };
}> => {
  console.log('Verifying OCR assets...');
  
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
      console.error(`OCR asset not found: ${file.name} at any location`);
    } else {
      console.log(`OCR asset verified: ${file.name} at ${result.path}`);
      
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

/**
 * Handles verification errors by providing user-friendly messages
 */
export const getVerificationErrorMessage = (missingFiles: string[]): string => {
  if (missingFiles.includes('Worker JS') && missingFiles.includes('Core WASM')) {
    return "Tesseract OCR engine files are missing. Please ensure the application is properly installed.";
  } 
  
  if (missingFiles.includes('Training Data')) {
    return "OCR language data is missing. Please ensure 'eng.traineddata' is properly installed.";
  }
  
  return `Some OCR files are missing: ${missingFiles.join(', ')}. Please reinstall the application.`;
};

/**
 * Diagnoses OCR-related issues and provides detailed information
 */
export const diagnoseOCRIssues = async (): Promise<{
  browserInfo: string;
  wasmSupported: boolean;
  filesAccessible: {[key: string]: boolean};
  suggestions: string[];
}> => {
  const diagnosis = {
    browserInfo: `${navigator.userAgent}`,
    wasmSupported: typeof WebAssembly === 'object',
    filesAccessible: {} as {[key: string]: boolean},
    suggestions: [] as string[]
  };
  
  // Check if browser supports WebAssembly
  if (!diagnosis.wasmSupported) {
    diagnosis.suggestions.push('Your browser does not support WebAssembly. Please use a modern browser like Chrome, Firefox, Edge, or Safari.');
  }
  
  // Check accessibility of required files
  const filesToCheck = [
    { path: TESSERACT_CONFIG.workerPath, name: 'worker' },
    { path: TESSERACT_CONFIG.corePath, name: 'wasm' },
    { path: TESSERACT_CONFIG.trainingDataPath, name: 'traindata' },
    { path: TESSERACT_CONFIG.fallbackPaths.workerPath, name: 'worker-fallback' },
    { path: TESSERACT_CONFIG.fallbackPaths.corePath, name: 'wasm-fallback' },
    { path: TESSERACT_CONFIG.fallbackPaths.trainingDataPath, name: 'traindata-fallback' }
  ];
  
  for (const file of filesToCheck) {
    try {
      const exists = await checkFileExists(file.path);
      diagnosis.filesAccessible[file.name] = exists;
      if (!exists) {
        diagnosis.suggestions.push(`The ${file.name} file at ${file.path} is not accessible. Check deployment configuration.`);
      }
    } catch (error) {
      diagnosis.filesAccessible[file.name] = false;
      diagnosis.suggestions.push(`Error checking ${file.name} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Add general suggestions
  if (Object.values(diagnosis.filesAccessible).some(value => !value)) {
    diagnosis.suggestions.push('Run the copy-wasm-assets.cjs script before deployment to ensure all necessary files are available.');
    diagnosis.suggestions.push('Check browser console for CORS errors that might prevent loading the WASM files.');
  }
  
  return diagnosis;
};

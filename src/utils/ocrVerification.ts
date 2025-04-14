
import { TESSERACT_CONFIG, checkFileExists } from './tesseractConfig';

/**
 * Verifies that all required OCR WASM assets are available
 * @returns Promise resolving to verification result
 */
export const verifyOCRAssets = async (): Promise<{
  success: boolean;
  missingFiles: string[];
  message: string;
}> => {
  console.log('Verifying OCR assets...');
  
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

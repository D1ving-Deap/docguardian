import { TESSERACT_CONFIG, checkFileExists, checkFileWithFallback, validateWasmFile } from './tesseractConfig';

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
  browserInfo?: any;
}> => {
  console.log('Verifying OCR assets...');
  
  // Check browser support first
  const browserInfo = {
    userAgent: navigator.userAgent,
    wasmSupported: typeof WebAssembly === 'object',
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isChrome: navigator.userAgent.indexOf('Chrome') > -1,
    isFirefox: navigator.userAgent.indexOf('Firefox') > -1,
    isEdge: navigator.userAgent.indexOf('Edg') > -1 || navigator.userAgent.indexOf('Edge') > -1,
    isSafari: navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1,
  };
  
  console.log('Browser information:', browserInfo);

  // If browser doesn't support WASM, fail early
  if (!browserInfo.wasmSupported) {
    console.error('WebAssembly is not supported in this browser');
    return {
      success: false,
      missingFiles: ['WebAssembly Support'],
      message: 'Your browser does not support WebAssembly, which is required for OCR',
      browserInfo
    };
  }
  
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
    try {
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
    } catch (error) {
      console.error(`Error checking file ${file.name}:`, error);
      missingFiles.push(`${file.name} (Error: ${error instanceof Error ? error.message : 'Unknown error'})`);
    }
  }
  
  if (missingFiles.length > 0) {
    return {
      success: false,
      missingFiles,
      message: `Missing OCR files: ${missingFiles.join(', ')}`,
      workingPaths,
      browserInfo
    };
  }
  
  return {
    success: true,
    missingFiles: [],
    message: 'All OCR files verified successfully',
    workingPaths,
    browserInfo
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
  browserInfo: any;
  wasmSupported: boolean;
  corsIssues: boolean;
  filesAccessible: {[key: string]: boolean};
  suggestions: string[];
}> => {
  // Browser capabilities check
  const browserInfo = {
    userAgent: navigator.userAgent,
    wasmSupported: typeof WebAssembly === 'object',
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isChrome: navigator.userAgent.indexOf('Chrome') > -1,
    isFirefox: navigator.userAgent.indexOf('Firefox') > -1,
    isEdge: navigator.userAgent.indexOf('Edg') > -1 || navigator.userAgent.indexOf('Edge') > -1,
    isSafari: navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1,
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
  };
  
  const diagnosis = {
    browserInfo,
    wasmSupported: typeof WebAssembly === 'object',
    corsIssues: false,
    filesAccessible: {} as {[key: string]: boolean},
    suggestions: [] as string[]
  };
  
  // Check if browser supports WebAssembly
  if (!diagnosis.wasmSupported) {
    diagnosis.suggestions.push('Your browser does not support WebAssembly. Please use a modern browser like Chrome, Firefox, Edge, or Safari.');
  }
  
  // Check if SharedArrayBuffer is available (required for threading in some WASM implementations)
  if (!browserInfo.hasSharedArrayBuffer) {
    diagnosis.suggestions.push('Your browser may not support SharedArrayBuffer, which can affect WASM performance.');
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
      const response = await fetch(file.path, { method: 'HEAD' });
      const exists = response.ok;
      diagnosis.filesAccessible[file.name] = exists;
      
      // Check for potential CORS issues
      if (!exists && response.status === 0) {
        diagnosis.corsIssues = true;
        diagnosis.suggestions.push(`The ${file.name} file at ${file.path} may be blocked by CORS policies.`);
      } else if (!exists) {
        diagnosis.suggestions.push(`The ${file.name} file at ${file.path} returned status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      diagnosis.filesAccessible[file.name] = false;
      // Network error might indicate CORS issue
      diagnosis.corsIssues = true;
      diagnosis.suggestions.push(`Error checking ${file.name} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Add browser-specific suggestions
  if (browserInfo.isSafari) {
    diagnosis.suggestions.push('Safari has stricter WASM and worker security policies. Consider using Chrome or Firefox if issues persist.');
  }
  
  if (browserInfo.isMobile) {
    diagnosis.suggestions.push('Mobile browsers may have limited WASM support or performance. For best results, use a desktop browser.');
  }
  
  // Add general suggestions
  if (Object.values(diagnosis.filesAccessible).some(value => !value)) {
    diagnosis.suggestions.push('Run the copy-wasm-assets.cjs script before deployment to ensure all necessary files are available.');
    
    if (diagnosis.corsIssues) {
      diagnosis.suggestions.push('CORS issues detected. Ensure the server has proper CORS headers for WASM files.');
      diagnosis.suggestions.push('If running locally, use a full development server rather than opening files directly.');
    }
  }
  
  return diagnosis;
};

/**
 * Tests a workaround for issues with Tesseract initialization
 */
export const testWorkerInitialization = async (): Promise<{success: boolean, error?: string}> => {
  try {
    console.log('Testing worker initialization...');
    
    // Create a simple worker to test if workers are functioning
    const workerCode = `
      self.onmessage = function(e) {
        self.postMessage('Worker is functioning');
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve) => {
      try {
        const worker = new Worker(workerUrl);
        
        worker.onmessage = function(e) {
          console.log('Test worker response:', e.data);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({success: true});
        };
        
        worker.onerror = function(error) {
          console.error('Test worker error:', error);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({success: false, error: `Worker error: ${error.message}`});
        };
        
        worker.postMessage('test');
        
        // Timeout after 3 seconds
        setTimeout(() => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({success: false, error: 'Worker initialization timed out'});
        }, 3000);
      } catch (error) {
        URL.revokeObjectURL(workerUrl);
        console.error('Error creating test worker:', error);
        resolve({success: false, error: `Worker creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`});
      }
    });
  } catch (error) {
    console.error('General error in worker test:', error);
    return {success: false, error: `General error: ${error instanceof Error ? error.message : 'Unknown error'}`};
  }
};

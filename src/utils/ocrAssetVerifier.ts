
import { TESSERACT_CONFIG, checkFileExists, validateWasmFile } from './tesseractConfig';
import { normalizePath } from './pathUtils';

/**
 * Performs comprehensive verification of OCR assets and provides detailed diagnostic information
 */
export const verifyOCRAssets = async (): Promise<{
  success: boolean;
  missingFiles: string[];
  message: string;
  details: {
    files: Record<string, {
      exists: boolean;
      valid?: boolean;
      path: string;
      size?: number;
    }>;
    browserInfo: {
      userAgent: string;
      wasmSupported: boolean;
      hasSharedArrayBuffer: boolean;
      isSecureContext: boolean;
      isMobile: boolean;
      browser: string;
    };
    suggestions: string[];
  };
  browserInfo?: any;
}> => {
  console.log('🔍 Starting comprehensive OCR asset verification...');
  
  // Browser capabilities check
  const browserInfo = {
    userAgent: navigator.userAgent,
    wasmSupported: typeof WebAssembly === 'object',
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    isSecureContext: window.isSecureContext,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    browser: navigator.userAgent.indexOf('Chrome') > -1 ? 'Chrome' : 
             navigator.userAgent.indexOf('Firefox') > -1 ? 'Firefox' :
             navigator.userAgent.indexOf('Safari') > -1 ? 'Safari' :
             navigator.userAgent.indexOf('Edge') > -1 ? 'Edge' : 'Unknown'
  };
  
  console.log('Browser information:', browserInfo);
  
  const filesToCheck = [
    { name: 'worker', path: TESSERACT_CONFIG.workerPath },
    { name: 'wasm', path: TESSERACT_CONFIG.corePath },
    { name: 'training', path: TESSERACT_CONFIG.trainingDataPath },
    { name: 'worker-fallback', path: normalizePath(TESSERACT_CONFIG.fallbackPaths.workerPath) },
    { name: 'wasm-fallback', path: normalizePath(TESSERACT_CONFIG.fallbackPaths.corePath) },
    { name: 'training-fallback', path: normalizePath(TESSERACT_CONFIG.fallbackPaths.trainingDataPath) }
  ];
  
  const fileStatus: Record<string, any> = {};
  let overallSuccess = true;
  const suggestions: string[] = [];
  const missingFiles: string[] = [];
  
  // Check each file existence and validity
  for (const file of filesToCheck) {
    console.log(`Checking ${file.name} at ${file.path}...`);
    const exists = await checkFileExists(file.path);
    
    fileStatus[file.name] = {
      exists,
      path: file.path
    };
    
    if (!exists) {
      console.error(`❌ ${file.name} not found at ${file.path}`);
      overallSuccess = false;
      missingFiles.push(file.name);
      continue;
    }
    
    try {
      // For WASM files, do an additional validation check
      if (file.name === 'wasm' || file.name === 'wasm-fallback') {
        console.log(`Validating WASM file ${file.path}...`);
        const isValid = await validateWasmFile(file.path);
        fileStatus[file.name].valid = isValid.success;
        
        if (!isValid.success) {
          console.error(`❌ ${file.name} is not a valid WASM file!`);
          overallSuccess = overallSuccess && false;
          missingFiles.push(`${file.name} (invalid)`);
        } else {
          console.log(`✅ ${file.name} is a valid WASM file`);
          
          // Get file size
          try {
            const response = await fetch(file.path, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
              const size = parseInt(contentLength, 10);
              fileStatus[file.name].size = size;
              console.log(`Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
            }
          } catch (error) {
            console.warn(`Couldn't get file size for ${file.path}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error checking ${file.name}:`, error);
      fileStatus[file.name].error = error instanceof Error ? error.message : String(error);
      overallSuccess = false;
      missingFiles.push(`${file.name} (error)`);
    }
  }
  
  // Generate suggestions based on findings
  if (!browserInfo.wasmSupported) {
    suggestions.push('Your browser does not support WebAssembly, which is required for OCR. Try using a modern browser like Chrome, Firefox, or Edge.');
  }
  
  if (!browserInfo.isSecureContext && !fileStatus['wasm'].exists) {
    suggestions.push('WebAssembly may require a secure context (HTTPS) to work properly. Try accessing the app via HTTPS.');
  }
  
  if (browserInfo.isMobile) {
    suggestions.push('Mobile browsers may have limited WebAssembly support. For best results, try using a desktop browser.');
  }
  
  // Check if main paths are missing but fallbacks are available
  if (!fileStatus['wasm'].exists && fileStatus['wasm-fallback'].exists) {
    suggestions.push('Primary WASM file is missing, but fallback is available. Update the app to use fallback paths.');
  }
  
  // Check for invalid WASM files
  if ((fileStatus['wasm'].exists && fileStatus['wasm'].valid === false) || 
      (fileStatus['wasm-fallback'].exists && fileStatus['wasm-fallback'].valid === false)) {
    suggestions.push('Invalid WASM file detected. This may be due to a CORS issue or corrupted download. Try running the copy-wasm-assets.cjs script again.');
  }
  
  const message = overallSuccess 
    ? 'All OCR files verified successfully' 
    : `Missing or invalid OCR files: ${missingFiles.join(', ')}`;
  
  return {
    success: overallSuccess,
    missingFiles,
    message,
    details: {
      files: fileStatus,
      browserInfo,
      suggestions
    },
    browserInfo
  };
};

/**
 * Attempts to fix common OCR asset issues automatically
 */
export const fixOCRAssetIssues = async (): Promise<{
  success: boolean;
  message: string;
  fixesApplied: string[];
}> => {
  console.log('🔧 Attempting to fix OCR asset issues...');
  const fixesApplied: string[] = [];
  
  try {
    // 1. Try loading WASM from different locations
    const alternativePaths = [
      '/tessdata/tesseract-core.wasm',
      '/tesseract-core.wasm',
      '/public/tessdata/tesseract-core.wasm',
      '/public/tesseract-core.wasm'
    ];
    
    let foundValidWasm = false;
    
    for (const path of alternativePaths) {
      console.log(`Trying WASM path: ${path}`);
      const exists = await checkFileExists(path);
      
      if (exists) {
        const isValid = await validateWasmFile(path);
        if (isValid) {
          console.log(`✅ Found valid WASM at ${path}`);
          foundValidWasm = true;
          fixesApplied.push(`Located valid WASM file at ${path}`);
          
          // Update session storage with valid path for future loads
          sessionStorage.setItem('ocr-wasm-path', path);
          break;
        }
      }
    }
    
    if (!foundValidWasm) {
      console.log('❌ Could not find valid WASM file in any location');
    }
    
    // 2. Check for CORS issues (if applicable)
    if (window.location.protocol === 'file:') {
      console.log('⚠️ Running from file:// protocol - CORS restrictions may prevent WASM loading');
      fixesApplied.push('Detected file:// protocol - WASM may not load due to CORS');
    }
    
    return {
      success: foundValidWasm,
      message: foundValidWasm 
        ? 'Successfully found working WASM file' 
        : 'Could not find valid WASM file - manual intervention required',
      fixesApplied
    };
  } catch (error) {
    console.error('Error applying fixes:', error);
    return {
      success: false,
      message: `Error attempting fixes: ${error instanceof Error ? error.message : String(error)}`,
      fixesApplied
    };
  }
};

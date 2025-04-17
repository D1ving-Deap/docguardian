import { OCRClient } from 'tesseract-wasm';

/**
 * Interface for Tesseract Configuration
 */
interface TesseractConfig {
  workerPath: string;
  corePath: string;
  trainingDataPath: string;
  fallbackPaths: {
    workerPath: string;
    corePath: string;
    trainingDataPath: string;
  };
}

// WASM file magic bytes constant (WebAssembly binary format identifier)
const WASM_MAGIC_BYTES = new Uint8Array([0x00, 0x61, 0x73, 0x6d]);

/**
 * Get base URL for the current environment
 * Handles both development and production environments
 */
const getBaseUrl = (): string => {
  // Get current domain
  const baseUrl = window.location.origin;
  
  console.log('Current URL:', window.location.href);
  console.log('Origin:', baseUrl);
  console.log('Pathname:', window.location.pathname);
  
  return baseUrl;
};

/**
 * Default configuration for Tesseract
 * Using multiple potential paths to improve resilience
 */
export const TESSERACT_CONFIG: TesseractConfig = {
  workerPath: `${getBaseUrl()}/tesseract/tesseract-worker.js`,
  corePath: `${getBaseUrl()}/tesseract/tesseract-core.wasm`,
  trainingDataPath: `${getBaseUrl()}/tesseract/eng.traineddata`,
};

/**
 * Validation result interface
 */
interface ValidationResult {
  success: boolean;
  path: string;
  error?: string;
}

/**
 * OCR Client configuration options
 */
interface OCRClientOptions {
  logger?: (message: any) => void;
  progressCallback?: (progress: number) => void;
  corePath?: string;
  workerPath?: string;
  trainingDataPath?: string;
  language?: string;
}

/**
 * Check if a file exists by making a HEAD request
 */
export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    // Add cache-busting parameter to prevent caching issues
    const urlWithCache = new URL(url, window.location.origin);
    urlWithCache.searchParams.append('_t', Date.now().toString());
    
    const response = await fetch(urlWithCache.toString(), { 
      method: 'HEAD',
      cache: 'no-store' // Explicitly avoid caching
    });
    return response.ok;
  } catch (error) {
    console.error(`Failed to check file at ${url}:`, error);
    return false;
  }
};

/**
 * Check for a file at both primary and fallback locations
 */
export const checkFileWithFallback = async (
  primaryPath: string,
  fallbackPath?: string
): Promise<{ exists: boolean; path: string }> => {
  // First try the primary path
  const primaryExists = await checkFileExists(primaryPath);
  if (primaryExists) {
    return { exists: true, path: primaryPath };
  }
  
  // If primary doesn't exist and fallback is provided, try that
  if (fallbackPath) {
    const fallbackExists = await checkFileExists(fallbackPath);
    if (fallbackExists) {
      return { exists: true, path: fallbackPath };
    }
  }
  
  // Neither path worked
  return { exists: false, path: primaryPath };
};

/**
 * Validate a WASM file by checking its magic bytes
 */
export const validateWasmFile = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`HTTP error when validating WASM: ${response.status}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check file size
    if (bytes.length < WASM_MAGIC_BYTES.length) {
      console.error(`WASM file too small: ${bytes.length} bytes`);
      return false;
    }

    // Check magic bytes
    const isValid = WASM_MAGIC_BYTES.every((byte, index) => bytes[index] === byte);
    if (!isValid) {
      const foundBytes = Array.from(bytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      console.error(`Invalid WASM header. Expected: 00 61 73 6d, Found: ${foundBytes}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error validating WASM file at ${url}:`, error);
    return false;
  }
};

/**
 * Resolves the best path to use by trying primary and fallback paths
 */
export const resolveBestPath = async (
  fileType: string,
  primaryPath: string,
  fallbackPath?: string
): Promise<ValidationResult> => {
  console.log(`Checking ${fileType} at primary path: ${primaryPath}`);
  if (await checkFileExists(primaryPath)) {
    const isValid = fileType === 'Core WASM' ? await validateWasmFile(primaryPath) : true;
    if (isValid) return { success: true, path: primaryPath };
    console.warn(`Invalid ${fileType} at primary path`);
  }

  if (fallbackPath) {
    console.log(`Trying ${fileType} at fallback path: ${fallbackPath}`);
    if (await checkFileExists(fallbackPath)) {
      const isValid = fileType === 'Core WASM' ? await validateWasmFile(fallbackPath) : true;
      if (isValid) return { success: true, path: fallbackPath };
      console.warn(`Invalid ${fileType} at fallback path`);
    }
  }

  // Additional paths to try for production environments
  const pathsToTry = [
    // Public directory roots - first priority
    `${window.location.origin}/tesseract-worker.js`,
    `${window.location.origin}/tesseract-core.wasm`,
    `${window.location.origin}/eng.traineddata`,
    
    // Tessdata subdirectory - second priority
    `${window.location.origin}/tessdata/tesseract-worker.js`,
    `${window.location.origin}/tessdata/tesseract-core.wasm`,
    `${window.location.origin}/tessdata/eng.traineddata`,
    
    // CDN fallbacks - third priority (use specific versions for stability)
    'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-worker.js',
    'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
    'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata',
    
    // Alternative CDNs - fourth priority
    'https://cdn.jsdelivr.net/npm/tesseract-wasm@0.10.0/dist/tesseract-worker.js',
    'https://cdn.jsdelivr.net/npm/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
    'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract-core.wasm'
  ];
  
  // Try each path that's relevant to the current file type
  for (const path of pathsToTry) {
    if ((fileType === 'Worker JS' && path.includes('worker')) ||
        (fileType === 'Core WASM' && path.includes('core')) ||
        (fileType === 'Training Data' && path.includes('eng.traineddata'))) {
      
      console.log(`Trying additional path: ${path}`);
      if (await checkFileExists(path)) {
        const isValid = fileType === 'Core WASM' ? await validateWasmFile(path) : true;
        if (isValid) {
          console.log(`Found valid ${fileType} at: ${path}`);
          return { success: true, path };
        }
      }
    }
  }
  
  // Last resort - force use CDN fallbacks
  if (fallbackPath && fileType === 'Core WASM') {
    console.warn(`Using fallback path as last resort: ${fallbackPath}`);
    return { success: true, path: fallbackPath };
  }
  
  if (fileType === 'Training Data') {
    const trainedDataCDN = 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata';
    console.warn(`Using CDN for training data as last resort: ${trainedDataCDN}`);
    return { success: true, path: trainedDataCDN };
  }

  return {
    success: false,
    path: primaryPath,
    error: `File not found at any location: primary (${primaryPath}) or fallback paths`,
  };
};

/**
 * Verify all required OCR files exist and are valid
 */
export const verifyOCRFiles = async (config: TesseractConfig = TESSERACT_CONFIG): Promise<{
  success: boolean;
  validationResults: Record<string, ValidationResult>;
  message: string;
}> => {
  // Check for cached paths from session storage
  const cachedWasmPath = sessionStorage.getItem('ocr-wasm-path');
  const cachedTrainingPath = sessionStorage.getItem('ocr-training-data-path');
  
  // If we have cached paths, use them instead of the defaults
  if (cachedWasmPath || cachedTrainingPath) {
    console.log('Using cached paths from session storage');
    if (cachedWasmPath) {
      console.log('Using cached WASM path:', cachedWasmPath);
    }
    if (cachedTrainingPath) {
      console.log('Using cached training data path:', cachedTrainingPath);
    }
    
    return {
      success: true,
      validationResults: {
        'Worker JS': { success: true, path: config.workerPath },
        'Core WASM': { success: true, path: cachedWasmPath || config.corePath },
        'Training Data': { success: true, path: cachedTrainingPath || config.trainingDataPath }
      },
      message: 'Using cached paths from session storage'
    };
  }

  const filesToCheck = [
    { name: 'Worker JS', primary: config.workerPath, fallback: config.fallbackPaths.workerPath },
    { name: 'Core WASM', primary: config.corePath, fallback: config.fallbackPaths.corePath },
    { name: 'Training Data', primary: config.trainingDataPath, fallback: config.fallbackPaths.trainingDataPath },
  ];

  const validationResults: Record<string, ValidationResult> = {};

  await Promise.all(
    filesToCheck.map(async (file) => {
      validationResults[file.name] = await resolveBestPath(file.name, file.primary, file.fallback);
    })
  );

  const failed = Object.entries(validationResults).filter(([_, result]) => !result.success);
  if (failed.length > 0) {
    const errorMessages = failed.map(([name, result]) => `${name}: ${result.error}`).join(', ');
    return {
      success: false,
      validationResults,
      message: `OCR file verification failed: ${errorMessages}`,
    };
  }

  return {
    success: true,
    validationResults,
    message: 'All OCR files verified successfully.',
  };
};

/**
 * Initialize OCR client with configuration
 */
export const createOCRClient = async (options: OCRClientOptions = {}): Promise<OCRClient> => {
  console.log('Initializing OCR client with options:', options);

  // For deployed environments, immediately default to CDN paths if we're on a subroute
  if (window.location.pathname.includes('/dashboard') || window.location.pathname.includes('/login')) {
    console.log('Detected subroute, prioritizing CDN paths');
    
    // If no explicit paths are set in options, use CDN paths
    if (!options.corePath) {
      options.corePath = 'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm';
    }
    if (!options.trainingDataPath) {
      options.trainingDataPath = 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata';
    }
    if (!options.workerPath) {
      options.workerPath = 'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-worker.js';
    }
  }

  // Check for cached paths from session storage
  const cachedWasmPath = sessionStorage.getItem('ocr-wasm-path');
  const cachedTrainingPath = sessionStorage.getItem('ocr-training-data-path');
  
  if (cachedWasmPath && !options.corePath) {
    console.log('Using cached WASM path from session storage:', cachedWasmPath);
    options.corePath = cachedWasmPath;
  }
  
  if (cachedTrainingPath && !options.trainingDataPath) {
    console.log('Using cached training data path from session storage:', cachedTrainingPath);
    options.trainingDataPath = cachedTrainingPath;
  }

  // If custom paths are provided in options, use those
  const config: TesseractConfig = {
    workerPath: options.workerPath || TESSERACT_CONFIG.workerPath,
    corePath: options.corePath || TESSERACT_CONFIG.corePath,
    trainingDataPath: options.trainingDataPath || TESSERACT_CONFIG.trainingDataPath,
    fallbackPaths: TESSERACT_CONFIG.fallbackPaths,
  };

  // Verify the required files exist
  const verification = await verifyOCRFiles(config);
  
  if (!verification.success) {
    throw new Error(`Failed to initialize OCR client: ${verification.message}`);
  }

  const paths = {
    workerPath: verification.validationResults['Worker JS'].path,
    corePath: verification.validationResults['Core WASM'].path,
    trainingDataPath: verification.validationResults['Training Data'].path,
  };

  console.log('Initializing OCR client with resolved paths:', paths);

  // Initialize the OCR client
  const client = new OCRClient({
    workerPath: paths.workerPath,
    corePath: paths.corePath,
    logger: options.logger || console.log,
  });

  console.log('Loading OCR model:', paths.trainingDataPath);
  await client.loadModel(paths.trainingDataPath);
  console.log('OCR model loaded successfully.');
  return client;
};

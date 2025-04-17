import { OCRClient } from 'tesseract-wasm';

/**
 * Configuration for Tesseract OCR
 */
export const TESSERACT_CONFIG: TesseractConfig = {
  workerPath: 'https://verify-flow.com/tessdata/tesseract-worker.js',
  corePath: 'https://verify-flow.com/tessdata/tesseract-core.wasm',
  trainingDataPath: 'https://verify-flow.com/tessdata/eng.traineddata',
  fallbackPaths: {
    workerPath: '/tesseract-worker.js',
    corePath: '/tesseract-core.wasm',
    trainingDataPath: '/eng.traineddata',
  },
};

// Default configuration for Tesseract
export const TESSERACT_CONFIG: TesseractConfig = {
  workerPath: process.env.TESSERACT_WORKER_PATH || '/tessdata/tesseract-worker.js',
  corePath: process.env.TESSERACT_CORE_PATH || '/tessdata/tesseract-core.wasm',
  trainingDataPath: process.env.TESSERACT_TRAINING_PATH || '/tessdata/eng.traineddata',
  fallbackPaths: {
    workerPath: '/tesseract-worker.js',
    corePath: '/tesseract-core.wasm',
    trainingDataPath: '/eng.traineddata',
  },
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

// WASM file magic bytes constant
const WASM_MAGIC_BYTES = new Uint8Array([0x00, 0x61, 0x73, 0x6D]);

/**
 * Default configuration for Tesseract
 */
export const TESSERACT_CONFIG: TesseractConfig = {
  workerPath: process.env.TESSERACT_WORKER_PATH || '/tessdata/tesseract-worker.js',
  corePath: process.env.TESSERACT_CORE_PATH || '/tessdata/tesseract-core.wasm',
  trainingDataPath: process.env.TESSERACT_TRAINING_PATH || '/tessdata/eng.traineddata',
  fallbackPaths: {
    workerPath: '/tesseract-worker.js',
    corePath: '/tesseract-core.wasm',
    trainingDataPath: '/eng.traineddata',
  },
};

/**
 * Check if a file exists by making a HEAD request
 */
export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Failed to check file at ${url}:`, error);
    return false;
  }
};

/**
 * Validate a WASM file by checking its magic bytes
 */
export const validateWasmFile = async (url: string): Promise<ValidationResult> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        path: url,
        error: `HTTP error: ${response.status}`,
      };
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check file size
    if (bytes.length < WASM_MAGIC_BYTES.length) {
      return {
        success: false,
        path: url,
        error: `File too small: ${bytes.length} bytes`,
      };
    }

    // Check magic bytes
    const isValid = WASM_MAGIC_BYTES.every((byte, index) => bytes[index] === byte);
    if (!isValid) {
      const foundBytes = Array.from(bytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      return {
        success: false,
        path: url,
        error: `Invalid WASM header. Expected: ${Array.from(WASM_MAGIC_BYTES)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')}, Found: ${foundBytes}`,
      };
    }

    return { success: true, path: url };
  } catch (error) {
    return {
      success: false,
      path: url,
      error: error instanceof Error ? error.message : String(error),
    };
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
    const validation = fileType === 'Core WASM' ? await validateWasmFile(primaryPath) : { success: true, path: primaryPath };
    if (validation.success) return validation;
    console.warn(`Invalid ${fileType} at primary path: ${validation.error}`);
  }

  if (fallbackPath) {
    console.log(`Trying ${fileType} at fallback path: ${fallbackPath}`);
    if (await checkFileExists(fallbackPath)) {
      const validation = fileType === 'Core WASM' ? await validateWasmFile(fallbackPath) : { success: true, path: fallbackPath };
      if (validation.success) return validation;
      console.warn(`Invalid ${fileType} at fallback path: ${validation.error}`);
    }
  }

  return {
    success: false,
    path: primaryPath,
    error: `File not found or invalid at both primary (${primaryPath}) and fallback (${fallbackPath || 'N/A'}) paths.`,
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
  const filesToCheck = [
    { name: 'Worker JS', primary: config.workerPath, fallback: config.fallbackPaths?.workerPath },
    { name: 'Core WASM', primary: config.corePath, fallback: config.fallbackPaths?.corePath },
    { name: 'Training Data', primary: config.trainingDataPath, fallback: config.fallbackPaths?.trainingDataPath },
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
  console.log('Initializing OCR client...');

  // Set up the paths for English only
  const config: TesseractConfig = {
    workerPath: options.workerPath || TESSERACT_CONFIG.workerPath,
    corePath: options.corePath || TESSERACT_CONFIG.corePath,
    trainingDataPath: TESSERACT_CONFIG.trainingDataPath, // Always use English
    fallbackPaths: TESSERACT_CONFIG.fallbackPaths,
  };

  // Verify the required files exist
  const verification = await verifyOCRFiles(config);
  if (!verification.success) throw new Error(verification.message);

  const paths = {
    workerPath: verification.validationResults['Worker JS'].path,
    corePath: verification.validationResults['Core WASM'].path,
    trainingDataPath: verification.validationResults['Training Data'].path,
  };

  // Initialize the OCR client
  const client = new OCRClient({
    workerPath: paths.workerPath,
    corePath: paths.corePath,
    logger: options.logger,
  });

  console.log('Loading OCR model:', paths.trainingDataPath);
  await client.loadModel(paths.trainingDataPath);
  console.log('OCR model loaded successfully.');
  return client;
};

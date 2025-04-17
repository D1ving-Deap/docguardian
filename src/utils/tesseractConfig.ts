
import { OCRClient } from 'tesseract-wasm';
import { createTesseractWorker } from './createTesseractWorker';

/** OCR Client configuration options */
interface OCRClientOptions {
  logger?: (message: any) => void;
  progressCallback?: (progress: number) => void;
  corePath?: string;
  workerPath?: string;
  trainingDataPath?: string;
  language?: string;
}

/** Validation result */
interface ValidationResult {
  success: boolean;
  path: string;
  error?: string;
  label?: string;
}

/** Tesseract config interface */
interface TesseractConfig {
  workerPath: string;
  corePath: string;
  trainingDataPath: string;
  fallbackPaths?: {
    workerPath?: string;
    corePath?: string;
    trainingDataPath?: string;
  };
}

// Configurable base path (can also be set via .env if needed)
const BASE_PATH = import.meta.env.VITE_TESSERACT_BASE_PATH || '';

export const TESSERACT_CONFIG: TesseractConfig = {
  workerPath: `/tesseract-worker.js`,
  corePath: `/tesseract-core.wasm`,
  trainingDataPath: `/eng.traineddata`,
  fallbackPaths: {
    workerPath: 'https://your-cdn.com/tesseract-worker.js',
    corePath: 'https://your-cdn.com/tesseract-core.wasm',
    trainingDataPath: 'https://your-cdn.com/eng.traineddata',
  }
};

const WASM_MAGIC_BYTES = new Uint8Array([0x00, 0x61, 0x73, 0x6D]);
const validationCache: Record<string, ValidationResult> = {};

export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Check file existence with fallback
 */
export const checkFileWithFallback = async (
  primaryPath: string,
  fallbackPath?: string
): Promise<{ exists: boolean; path: string }> => {
  // Try primary path first
  try {
    const primaryExists = await checkFileExists(primaryPath);
    if (primaryExists) {
      return { exists: true, path: primaryPath };
    }
    
    // If primary fails and fallback exists, try fallback
    if (fallbackPath) {
      const fallbackExists = await checkFileExists(fallbackPath);
      if (fallbackExists) {
        return { exists: true, path: fallbackPath };
      }
    }
    
    // Nothing worked
    return { exists: false, path: primaryPath };
  } catch (error) {
    console.error(`Error checking file ${primaryPath}:`, error);
    return { exists: false, path: primaryPath };
  }
};

export const validateWasmFile = async (url: string): Promise<ValidationResult> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return { success: false, path: url, error: `HTTP ${res.status}` };

    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const valid = WASM_MAGIC_BYTES.every((b, i) => bytes[i] === b);
    return valid
      ? { success: true, path: url }
      : { success: false, path: url, error: 'Invalid WASM header' };
  } catch (err: any) {
    return { success: false, path: url, error: err.message };
  }
};

export const validateTrainingData = async (url: string): Promise<ValidationResult> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return { success: false, path: url, error: `HTTP ${res.status}` };
    const size = parseInt(res.headers.get('content-length') || '0', 10);
    if (size < 1024) return { success: false, path: url, error: 'Training file too small' };
    return { success: true, path: url };
  } catch (err: any) {
    return { success: false, path: url, error: err.message };
  }
};

const resolveBestPath = async (
  label: string,
  primary: string,
  fallback?: string,
  validateWasm = false
): Promise<ValidationResult> => {
  if (validationCache[primary]) return { ...validationCache[primary], label };

  const validate = label.includes('WASM')
    ? validateWasmFile
    : validateTrainingData;

  const primaryValid = await validate(primary);
  if (primaryValid.success) {
    validationCache[primary] = { ...primaryValid, label };
    return validationCache[primary];
  }

  if (fallback) {
    const fallbackValid = await validate(fallback);
    if (fallbackValid.success) {
      validationCache[primary] = { ...fallbackValid, label };
      return validationCache[primary];
    }
  }

  return {
    success: false,
    path: primary,
    label,
    error: `Failed to load ${label}. Tried: ${primary}, fallback: ${fallback || 'none'}`,
  };
};

export const verifyOCRFiles = async (config: TesseractConfig = TESSERACT_CONFIG) => {
  const [worker, wasm, trained] = await Promise.all([
    resolveBestPath('Worker JS', config.workerPath, config.fallbackPaths?.workerPath),
    resolveBestPath('Core WASM', config.corePath, config.fallbackPaths?.corePath, true),
    resolveBestPath('Training Data', config.trainingDataPath, config.fallbackPaths?.trainingDataPath),
  ]);

  const result = {
    success: worker.success && wasm.success && trained.success,
    validationResults: { worker, wasm, trained },
    message: 'OCR asset check complete',
  };

  if (!result.success) {
    console.warn('⚠️ OCR asset verification failed:', result);
  }

  return result;
};

export const createOCRClient = async (options: OCRClientOptions = {}): Promise<OCRClient> => {
  console.log('Creating OCR client with options:', options);
  
  const { validationResults, success } = await verifyOCRFiles(TESSERACT_CONFIG);
  if (!success) {
    console.error('OCR setup failed. Assets missing or invalid:', validationResults);
    throw new Error('OCR setup failed. Assets missing or invalid.');
  }

  try {
    // Create worker using the blob-based approach
    console.log('Creating Tesseract worker using blob-based approach');
    const worker = await createTesseractWorker(options.workerPath || validationResults.worker.path);
    console.log('Tesseract worker created successfully');
    
    // Get custom paths or use validated paths
    const corePath = options.corePath || validationResults.wasm.path;
    const trainingDataPath = options.trainingDataPath || validationResults.trained.path;
    
    console.log('Initializing OCR client with paths:', {
      corePath,
      trainingDataPath
    });
    
    const client = new OCRClient({
      worker,
      corePath,
      logger: options.logger,
    });

    console.log('Loading OCR model...');
    await client.loadModel(trainingDataPath, options.progressCallback);
    console.log('OCR model loaded successfully');
    
    return client;
  } catch (error) {
    console.error('Failed to create OCR client:', error);
    throw new Error(`OCR initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

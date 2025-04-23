import { OCRClient } from 'tesseract-wasm';

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

/** File check result */
interface FileCheckResult {
  exists: boolean;
  path: string;
}

/** Tesseract config interface */
interface TesseractConfig {
  workerPath: string;
  corePath: string;
  trainingDataPath: string;
  fallbackPaths?: {
    workerPath?: string[];
    corePath?: string[];
    trainingDataPath?: string[];
  };
}

// For Vite handling of import.meta.url with assets
const getAssetUrl = (relativePath: string): string => {
  try {
    // Try dynamic import URL approach (only works in Vite in some contexts)
    const baseUrl = import.meta.env.BASE_URL || '/';
    return new URL(`${baseUrl}${relativePath}`, window.location.origin).href;
  } catch (e) {
    // Fallback to normal path
    return `/${relativePath}`;
  }
};

export const TESSERACT_CONFIG: TesseractConfig = {
  workerPath: `/tessdata/tesseract-worker.js`,
  corePath: `/tessdata/tesseract-core.wasm`,
  trainingDataPath: `/tessdata/eng.traineddata`,
  fallbackPaths: {
    // Multiple fallback paths in order of preference
    workerPath: [
      '/tessdata/tesseract-worker.js',
      '/tesseract-worker.js',
      '/assets/tesseract-worker.js',
      'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-worker.js'
    ],
    corePath: [
      '/tessdata/tesseract-core.wasm',
      '/tesseract-core.wasm',
      '/assets/tesseract-core.wasm',
      'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm'
    ],
    trainingDataPath: [
      '/tessdata/eng.traineddata',
      '/eng.traineddata',
      'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata'
    ]
  }
};

const WASM_MAGIC_BYTES = new Uint8Array([0x00, 0x61, 0x73, 0x6D]);
const validationCache: Record<string, ValidationResult> = {};

export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    // Use absolute URL resolution to avoid path issues with nested routes
    let absoluteUrl = url;
    if (!url.startsWith('http') && !url.startsWith('blob:')) {
      // Make path absolute if it's not already
      const baseOrigin = window.location.origin;
      absoluteUrl = url.startsWith('/') 
        ? `${baseOrigin}${url}` 
        : `${baseOrigin}/${url}`;
    }
    
    console.log(`Checking if file exists: ${absoluteUrl}`);
    const res = await fetch(absoluteUrl, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
};

export const checkFileWithFallback = async (
  primaryPath: string,
  fallbackPath?: string
): Promise<FileCheckResult> => {
  // First try primary path
  const primaryExists = await checkFileExists(primaryPath);
  if (primaryExists) {
    return { exists: true, path: primaryPath };
  }
  
  // If fallback path is provided, try that next
  if (fallbackPath) {
    const fallbackExists = await checkFileExists(fallbackPath);
    if (fallbackExists) {
      return { exists: true, path: fallbackPath };
    }
  }
  
  // If we get here, neither path worked
  return { exists: false, path: primaryPath };
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
  fallbacks?: string[],
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

  if (fallbacks && fallbacks.length > 0) {
    // Try each fallback in sequence
    for (const fallback of fallbacks) {
      const fallbackValid = await validate(fallback);
      if (fallbackValid.success) {
        validationCache[primary] = { ...fallbackValid, label, path: fallback };
        console.log(`Using fallback path for ${label}: ${fallback}`);
        return validationCache[primary];
      }
    }
  }

  return {
    success: false,
    path: primary,
    label,
    error: `Failed to load ${label}. Tried: ${primary}, fallbacks: ${fallbacks?.join(', ') || 'none'}`,
  };
};

export const verifyOCRFiles = async (config: TesseractConfig = TESSERACT_CONFIG) => {
  // Try with multiple fallbacks
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
  const { validationResults, success } = await verifyOCRFiles(TESSERACT_CONFIG);
  if (!success) throw new Error('OCR setup failed. Assets missing or invalid.');

  const client = new OCRClient({
    workerPath: options.workerPath || validationResults.worker.path,
    corePath: options.corePath || validationResults.wasm.path,
    logger: options.logger,
  });

  await client.loadModel(options.trainingDataPath || validationResults.trained.path, options.progressCallback);
  return client;
};

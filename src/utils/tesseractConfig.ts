// src/utils/tesseractConfig.ts

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

// Configurable base path for portability
const BASE_PATH = process.env.TESSERACT_BASE_PATH || '/tessdata';

export const TESSERACT_CONFIG: TesseractConfig = {
  workerPath: '/tessdata/tesseract-worker.js',
  corePath: '/tessdata/tesseract-core.wasm',
  trainingDataPath: 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/eng.traineddata',
  fallbackPaths: {
    trainingDataPath: '/tessdata/eng.traineddata'
  }
};

const WASM_MAGIC_BYTES = new Uint8Array([0x00, 0x61, 0x73, 0x6D]);
const validationCache: Record<string, ValidationResult> = {};

const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (err) {
    console.error('File check failed:', url);
    return false;
  }
};

const validateWasmFile = async (url: string): Promise<ValidationResult> => {
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

const validateTrainingData = async (url: string): Promise<ValidationResult> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return { success: false, path: url, error: `HTTP ${res.status}` };
    const size = parseInt(res.headers.get('content-length') || '0', 10);
    if (size < 1) return { success: false, path: url, error: 'Invalid file size' };
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

  const check = async (path: string, validate: boolean) => {
    if (await checkFileExists(path)) {
      if (validate) return await validateWasmFile(path);
      if (label.toLowerCase().includes('training')) return await validateTrainingData(path);
      return { success: true, path };
    }
    return null;
  };

  const primaryResult = await check(primary, validateWasm);
  if (primaryResult) {
    validationCache[primary] = { ...primaryResult, label };
    return validationCache[primary];
  }

  if (fallback) {
    const fallbackResult = await check(fallback, validateWasm);
    if (fallbackResult) {
      validationCache[primary] = { ...fallbackResult, label };
      return validationCache[primary];
    }
  }

  return {
    success: false,
    path: primary,
    error: `${label} not found. Tried: primary (${primary}), fallback (${fallback || 'none'})`,
    label
  };
};

export const verifyOCRFiles = async (config: TesseractConfig = TESSERACT_CONFIG) => {
  const checks = await Promise.all([
    resolveBestPath('Worker JS', config.workerPath, config.fallbackPaths?.workerPath),
    resolveBestPath('Core WASM', config.corePath, config.fallbackPaths?.corePath, true),
    resolveBestPath('Training Data', config.trainingDataPath, config.fallbackPaths?.trainingDataPath)
  ]);

  const [worker, wasm, trained] = checks;
  const result = {
    success: worker.success && wasm.success && trained.success,
    validationResults: {
      worker,
      wasm,
      trained
    },
    message: 'OCR file verification complete.'
  };

  if (!result.success) {
    console.warn('OCR verification failed:', result);
  }

  return result;
};

export const createOCRClient = async (options: OCRClientOptions = {}): Promise<OCRClient> => {
  const { validationResults, success } = await verifyOCRFiles(TESSERACT_CONFIG);
  if (!success) throw new Error('OCR dependency files missing or invalid.');

  const client = new OCRClient({
    corePath: validationResults.wasm.path,
    workerPath: validationResults.worker.path,
    logger: options.logger
  });

  await client.loadModel(validationResults.trained.path, options.progressCallback);
  return client;
};

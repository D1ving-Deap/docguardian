// src/utils/tesseractOCR.ts
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';
import { TESSERACT_CONFIG } from './tesseractConfig';

interface OCROptions {
  progressCallback?: (progress: number) => void;
  logger?: (message: any) => void;
}

/** Helper to HEAD check an asset path */
const checkAsset = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
};

/** Determine fallback paths */
const resolveAssetPath = async (
  label: string,
  primary: string,
  fallback?: string
): Promise<string> => {
  if (await checkAsset(primary)) return primary;
  if (fallback && await checkAsset(fallback)) return fallback;

  throw new Error(
    `${label} not found or unreachable.\nTried:\n→ ${primary}\n→ ${fallback || 'N/A'}`
  );
};

/** Perform OCR and return extracted text + confidence */
export const performOCR = async (
  file: File | Blob,
  options: OCROptions = {}
): Promise<OCRResult> => {
  let ocrClient: OCRClient | null = null;

  try {
    const logger = options.logger || console.log;
    logger('🔍 Starting OCR processing...');

    // Resolve asset paths with fallback
    const corePath = await resolveAssetPath(
      'Core WASM',
      TESSERACT_CONFIG.corePath,
      TESSERACT_CONFIG.fallbackPaths?.corePath
    );
    const workerPath = await resolveAssetPath(
      'Worker JS',
      TESSERACT_CONFIG.workerPath,
      TESSERACT_CONFIG.fallbackPaths?.workerPath
    );
    const trainingDataPath = await resolveAssetPath(
      'Training Data',
      TESSERACT_CONFIG.trainingDataPath,
      TESSERACT_CONFIG.fallbackPaths?.trainingDataPath
    );

    // Step 1: Initialize OCR client
    logger('⚙️ Initializing OCR Client...');
    ocrClient = new OCRClient({
      corePath,
      workerPath,
      logger,
    });

    await ocrClient.loadModel(trainingDataPath, options.progressCallback);
    logger('✅ Model loaded successfully.');

    // Step 2: Convert file to image
    const imageBitmap = await createImageBitmap(file);
    logger(`🖼️ Image loaded: ${imageBitmap.width} x ${imageBitmap.height}`);

    // Step 3: Process image
    await ocrClient.loadImage(imageBitmap);
    const text = await ocrClient.getText();
    logger('📝 OCR Text Extracted');

    // Step 4: Estimate confidence
    const confidence = text.length > 400 ? 95 : text.length > 200 ? 88 : 75;

    return {
      text,
      confidence,
      progress: 100
    };
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ OCR error:', message);
    throw new Error(`OCR failed: ${message}`);
  } finally {
    if (ocrClient) {
      try {
        ocrClient.destroy();
      } catch (cleanupError) {
        console.warn('⚠️ OCR cleanup failed:', cleanupError);
      }
    }
  }
};

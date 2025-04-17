
// src/utils/tesseractOCR.ts
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';
import { TESSERACT_CONFIG } from './tesseractConfig';
import { createWorkerBlobURL, createTesseractWorker } from './createWorkerBlobURL';

interface OCROptions {
  progressCallback?: (progress: number) => void;
  logger?: (message: any) => void;
  corePath?: string;
  workerPath?: string;
  trainingDataPath?: string;
}

/** Helper to HEAD check an asset path */
const checkAsset = async (url: string): Promise<boolean> => {
  try {
    // Make URL absolute to avoid nested route issues
    let absoluteUrl = url;
    if (!url.startsWith('http') && !url.startsWith('blob:')) {
      const baseOrigin = window.location.origin;
      absoluteUrl = url.startsWith('/') 
        ? `${baseOrigin}${url}` 
        : `${baseOrigin}/${url}`;
    }
    
    console.log(`Checking asset at: ${absoluteUrl}`);
    const res = await fetch(absoluteUrl, { method: 'HEAD' });
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
  let workerBlobURL: string | null = null;

  try {
    const logger = options.logger || console.log;
    logger('🔍 Starting OCR processing...');

    // Create worker blob URL for the worker script
    workerBlobURL = await createWorkerBlobURL(options.workerPath || TESSERACT_CONFIG.workerPath);
    logger(`⚙️ Created worker blob URL: ${workerBlobURL}`);

    // Resolve asset paths with fallback
    const corePath = options.corePath || await resolveAssetPath(
      'Core WASM',
      TESSERACT_CONFIG.corePath,
      TESSERACT_CONFIG.fallbackPaths?.corePath
    );
    
    const trainingDataPath = options.trainingDataPath || await resolveAssetPath(
      'Training Data',
      TESSERACT_CONFIG.trainingDataPath,
      TESSERACT_CONFIG.fallbackPaths?.trainingDataPath
    );

    // Step 1: Initialize OCR client
    logger('⚙️ Initializing OCR Client...');
    ocrClient = new OCRClient({
      corePath,
      workerPath: workerBlobURL,
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
    
    // Cleanup the blob URL to prevent memory leaks
    if (workerBlobURL && workerBlobURL.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(workerBlobURL);
        console.log('Revoked worker blob URL');
      } catch (revokeError) {
        console.warn('Failed to revoke worker blob URL:', revokeError);
      }
    }
  }
};

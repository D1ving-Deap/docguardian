
// src/utils/tesseractOCR.ts
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';

interface OCROptions {
  progressCallback?: (progress: number) => void;
  logger?: (message: any) => void;
}

/** Perform OCR and return extracted text + confidence */
export const performOCR = async (
  file: File | Blob,
  options: OCROptions = {}
): Promise<OCRResult> => {
  let ocrClient: OCRClient | null = null;

  try {
    const logger = options.logger || console.log;
    logger('🔍 Starting OCR processing...');

    // Step 1: Initialize OCR client with blob-based worker
    logger('⚙️ Initializing OCR Client...');
    ocrClient = await createOCRClient({
      progressCallback: options.progressCallback,
      logger
    });
    
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

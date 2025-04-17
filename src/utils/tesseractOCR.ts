
// src/utils/tesseractOCR.ts
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';

interface OCROptions {
  progressCallback?: (progress: number) => void;
  logger?: (message: any) => void;
  corePath?: string;
  trainingDataPath?: string;
}

/** Perform OCR and return extracted text + confidence */
export const performOCR = async (
  file: File | Blob,
  options: OCROptions | ((progress: number) => void) = {}
): Promise<OCRResult> => {
  let ocrClient: OCRClient | null = null;
  
  // Handle the case where options is a function (backward compatibility)
  const normalizedOptions: OCROptions = typeof options === 'function' 
    ? { progressCallback: options } 
    : options;

  try {
    const logger = normalizedOptions.logger || console.log;
    logger('🔍 Starting OCR processing...');

    // Step 1: Initialize OCR client with blob-based worker
    logger('⚙️ Initializing OCR Client...');
    
    // Check for cached paths in session storage
    const cachedWasmPath = sessionStorage.getItem('ocr-wasm-path');
    const cachedTrainingDataPath = sessionStorage.getItem('ocr-training-data-path');
    
    const clientOptions: OCROptions = {
      ...normalizedOptions
    };
    
    if (cachedWasmPath) {
      logger(`📦 Using cached WASM path: ${cachedWasmPath}`);
      clientOptions.corePath = cachedWasmPath;
    }
    
    if (cachedTrainingDataPath) {
      logger(`📦 Using cached training data path: ${cachedTrainingDataPath}`);
      clientOptions.trainingDataPath = cachedTrainingDataPath;
    }
    
    ocrClient = await createOCRClient(clientOptions);
    
    logger('✅ Model loaded successfully.');

    // Step 2: Convert file to image
    logger('🖼️ Converting file to image...');
    const imageBitmap = await createImageBitmap(file);
    logger(`🖼️ Image loaded: ${imageBitmap.width} x ${imageBitmap.height}`);

    // Step 3: Process image
    logger('🔎 Processing image with OCR...');
    await ocrClient.loadImage(imageBitmap);
    const text = await ocrClient.getText();
    logger('📝 OCR Text Extracted');

    // Step 4: Estimate confidence
    const wordCount = text.split(/\s+/).length;
    const confidence = wordCount > 100 ? 95 : wordCount > 50 ? 88 : wordCount > 20 ? 80 : 75;
    
    logger(`🔍 OCR complete: extracted ${text.length} characters, ${wordCount} words, estimated confidence: ${confidence}%`);

    return {
      text,
      confidence,
      progress: 100
    };
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ OCR error:', message);
    
    // Add detailed diagnostic information about what went wrong
    console.error('OCR Diagnostic Information:', {
      fileType: file.type,
      fileSize: file.size,
      cachedWasmPath: sessionStorage.getItem('ocr-wasm-path'),
      cachedTrainingDataPath: sessionStorage.getItem('ocr-training-data-path'),
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
      },
      errorDetails: error
    });
    
    throw new Error(`OCR failed: ${message}`);
  } finally {
    if (ocrClient) {
      try {
        ocrClient.destroy();
        logger('🧹 OCR client destroyed');
      } catch (cleanupError) {
        console.warn('⚠️ OCR cleanup failed:', cleanupError);
      }
    }
  }
};

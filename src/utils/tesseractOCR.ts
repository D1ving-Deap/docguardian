
// src/utils/tesseractOCR.ts
import { OCRClient } from 'tesseract-wasm';
import { createOCRClient } from './tesseractConfig';
import { OCRResult } from './types/ocrTypes';
import { TESSERACT_CONFIG } from './tesseractConfig';
import { createWorkerBlobURL, resolveWasmUrl } from './directWasmDownloader';
import { normalizePath } from './pathUtils';

export interface OCROptions {
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
      const basePath = import.meta.env.BASE_URL || '/';
      
      absoluteUrl = url.startsWith('/') 
        ? `${baseOrigin}${url}` 
        : `${baseOrigin}${basePath}${url}`;
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
  fallback?: string | string[]
): Promise<string> => {
  if (await checkAsset(primary)) return primary;
  
  // Handle string or array fallback
  if (fallback) {
    if (Array.isArray(fallback)) {
      // Try each fallback in the array
      for (const path of fallback) {
        if (await checkAsset(path)) return path;
      }
    } else if (await checkAsset(fallback)) {
      return fallback;
    }
  }

  // Look for the file in alternative locations
  const baseUrl = import.meta.env.BASE_URL || '/';
  const fileName = primary.split('/').pop();
  
  if (fileName) {
    const alternativePaths = [
      `/tessdata/${fileName}`,
      `${baseUrl}tessdata/${fileName}`,
      `/assets/${fileName}`,
      `${baseUrl}assets/${fileName}`,
      `/${fileName}`,
      `${baseUrl}${fileName}`
    ];
    
    for (const path of alternativePaths) {
      if (await checkAsset(path)) {
        console.log(`Found ${label} at alternative location: ${path}`);
        return path;
      }
    }
  }

  throw new Error(
    `${label} not found or unreachable.\nTried:\n→ ${primary}\n→ ${
      Array.isArray(fallback) ? fallback.join('\n→ ') : fallback || 'N/A'
    }`
  );
};

/** Verify that OCR assets are available and accessible */
export const verifyOCRAssets = async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const userAgent = navigator.userAgent;
    const details = {
      suggestions: [] as string[],
      browserInfo: {
        userAgent,
        isChrome: userAgent.includes('Chrome'),
        isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome')
      }
    };
    
    // Check primary files
    const workerPath = `/tessdata/tesseract-worker.js`;
    const wasmPath = `/tessdata/tesseract-core.wasm`;
    const trainingPath = `/tessdata/eng.traineddata`;

    // Check all paths
    const checkWorker = await fetch(workerPath, { method: 'HEAD' }).catch(() => ({ ok: false }));
    const checkWasm = await fetch(wasmPath, { method: 'HEAD' }).catch(() => ({ ok: false }));
    const checkTraining = await fetch(trainingPath, { method: 'HEAD' }).catch(() => ({ ok: false }));
    
    const missingFiles = [];
    if (!checkWorker.ok) missingFiles.push('Worker JS');
    if (!checkWasm.ok) missingFiles.push('WASM Core');
    if (!checkTraining.ok) missingFiles.push('Training Data');
    
    // Add suggestions based on issues
    if (missingFiles.length > 0) {
      details.suggestions.push(`Missing files: ${missingFiles.join(', ')}`);
      details.suggestions.push('Try running the manual asset copy script');
      
      if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        details.suggestions.push('Safari has limited WASM support - try Chrome');
      }
    }
    
    return {
      success: checkWorker.ok && checkWasm.ok && checkTraining.ok,
      missingFiles,
      message: missingFiles.length > 0 
        ? `Missing OCR assets: ${missingFiles.join(', ')}` 
        : 'All OCR assets verified',
      browserInfo: { userAgent },
      details
    };
  } catch (error) {
    console.error('Error verifying OCR assets:', error);
    return {
      success: false,
      missingFiles: ['Verification error'],
      message: error instanceof Error ? error.message : 'Unknown error',
      browserInfo: { userAgent: navigator.userAgent },
      details: {
        suggestions: ['Error during verification', 'Try running the manual copy script'],
        browserInfo: { userAgent: navigator.userAgent }
      }
    };
  }
};

// Try to load the WASM file using the URL import approach (Vite specific)
const getWasmUrl = async (): Promise<string> => {
  try {
    // First check if we have a cached URL in session storage
    const cachedWasmPath = sessionStorage.getItem('ocr-wasm-path');
    if (cachedWasmPath && cachedWasmPath.startsWith('blob:')) {
      console.log('Using cached WASM blob URL:', cachedWasmPath);
      return cachedWasmPath;
    }
    
    // Try to resolve the WASM file URL
    const wasmUrl = await resolveWasmUrl(TESSERACT_CONFIG.corePath);
    console.log('Resolved WASM URL:', wasmUrl);
    return wasmUrl;
  } catch (error) {
    console.error('Error getting WASM URL:', error);
    throw error;
  }
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
    const progressCallback = options.progressCallback || (() => {});
    
    logger('🔍 Starting OCR processing...');

    // Create worker blob URL for the worker script
    const workerPath = options.workerPath || TESSERACT_CONFIG.workerPath;
    workerBlobURL = await createWorkerBlobURL(normalizePath(workerPath));
    logger(`⚙️ Created worker blob URL: ${workerBlobURL}`);

    // Try different approaches to get the WASM URL
    let wasmUrl = options.corePath;
    if (!wasmUrl) {
      try {
        // Try to get the WASM URL using standard URL approach for Vite
        // Use absolute paths to avoid nested route issues
        const baseOrigin = window.location.origin;
        const basePath = '/tessdata/tesseract-core.wasm';
        const resolvedUrl = new URL(basePath, baseOrigin).href;
        logger(`⚙️ Using resolved URL: ${resolvedUrl}`);
        wasmUrl = resolvedUrl;
      } catch (error) {
        logger('Error creating URL:', error);
        // Fallback to resolveWasmUrl function
        wasmUrl = await resolveWasmUrl();
      }
    }
    
    logger(`⚙️ Using WASM URL: ${wasmUrl}`);
    
    // Resolve training data path
    const trainingDataPath = options.trainingDataPath || 
      new URL('/tessdata/eng.traineddata', window.location.origin).href;
    logger(`⚙️ Using training data path: ${trainingDataPath}`);

    // Step 1: Initialize OCR client with resolved paths
    logger('⚙️ Initializing OCR Client...');
    ocrClient = new OCRClient({
      corePath: wasmUrl,
      workerPath: workerBlobURL,
      logger,
    });

    // Load the OCR model with progress tracking
    await ocrClient.loadModel(trainingDataPath, (progress) => {
      logger(`Model loading progress: ${Math.round(progress * 100)}%`);
      progressCallback(progress);
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

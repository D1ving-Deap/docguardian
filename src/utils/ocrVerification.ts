
// src/utils/ocrVerification.ts
import { TESSERACT_CONFIG } from './tesseractConfig';
import { normalizePath, createAbsoluteUrl } from './pathUtils';

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


/**
 * Utilities for directly downloading WASM files to overcome CORS and path issues
 */

import { normalizePath, createAbsoluteUrl } from './pathUtils';

// Check if in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Directly download and store a WASM file in the browser to work around CORS issues
 */
export const downloadWasmFile = async (filename: string): Promise<boolean> => {
  if (!isBrowser) return false;

  try {
    console.log(`Attempting to download WASM file: ${filename}`);
    const sources = [
      `/tessdata/${filename}`,
      `/${filename}`,
      `/assets/${filename}`,
      `https://unpkg.com/tesseract-wasm@0.10.0/dist/${filename}`
    ];

    // Track the source for debugging
    let sourceUsed = '';

    // Try each source
    for (const source of sources) {
      try {
        console.log(`Trying source: ${source}`);
        const absoluteUrl = createAbsoluteUrl(source);
        
        // Use arraybuffer to ensure we get binary data, not text
        const response = await fetch(absoluteUrl, { 
          cache: 'no-cache',
          headers: { 'Accept': 'application/octet-stream' }
        });
        
        if (!response.ok) {
          console.warn(`Failed to fetch from ${absoluteUrl}: ${response.status}`);
          continue;
        }

        // Get binary data
        const arrayBuffer = await response.arrayBuffer();
        
        // Validate WASM magic bytes
        const bytes = new Uint8Array(arrayBuffer);
        const WASM_MAGIC_BYTES = new Uint8Array([0x00, 0x61, 0x73, 0x6D]);
        
        const isValidWasm = bytes.length >= WASM_MAGIC_BYTES.length && 
                           WASM_MAGIC_BYTES.every((b, i) => bytes[i] === b);
        
        if (!isValidWasm) {
          console.warn(`Invalid WASM file from ${absoluteUrl}. First bytes:`, 
            Array.from(bytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
          continue;
        }

        // Create blob URL
        const blob = new Blob([arrayBuffer], { type: 'application/wasm' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Store in session storage
        sessionStorage.setItem('ocr-wasm-path', blobUrl);
        sessionStorage.setItem('ocr-wasm-binary', 'cached');
        sessionStorage.setItem('ocr-wasm-source', source);
        
        console.log(`Successfully downloaded WASM file from ${absoluteUrl}`);
        console.log(`Created blob URL: ${blobUrl}`);
        sourceUsed = source;
        return true;
      } catch (err) {
        console.error(`Error downloading from ${source}:`, err);
      }
    }

    console.error('Failed to download WASM file from any source');
    return false;
  } catch (error) {
    console.error('WASM download error:', error);
    return false;
  }
};

/**
 * Download training data file
 */
export const downloadTrainingData = async (): Promise<boolean> => {
  if (!isBrowser) return false;

  try {
    const sources = [
      '/tessdata/eng.traineddata',
      '/eng.traineddata',
      'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata'
    ];

    for (const source of sources) {
      try {
        const absoluteUrl = createAbsoluteUrl(source);
        console.log(`Checking training data at: ${absoluteUrl}`);
        
        const response = await fetch(absoluteUrl, { 
          method: 'HEAD',
          cache: 'no-cache' 
        });
        
        if (response.ok) {
          sessionStorage.setItem('ocr-training-data-path', absoluteUrl);
          console.log(`Found valid training data at: ${absoluteUrl}`);
          return true;
        }
      } catch (err) {
        console.warn(`Error checking ${source}:`, err);
      }
    }

    console.error('Could not find valid training data');
    return false;
  } catch (error) {
    console.error('Training data download error:', error);
    return false;
  }
};

/**
 * Get cached WASM blob URL if available
 */
export const createWasmBlobUrl = (): string | null => {
  if (!isBrowser) return null;
  
  try {
    return sessionStorage.getItem('ocr-wasm-path');
  } catch {
    return null;
  }
};

/**
 * Create a URL for a WASM file with fallbacks
 */
export const resolveWasmUrl = async (defaultPath = '/tessdata/tesseract-core.wasm'): Promise<string> => {
  // First check if we have a cached blob URL
  const cachedBlobUrl = createWasmBlobUrl();
  if (cachedBlobUrl) {
    console.log(`Using cached WASM blob URL: ${cachedBlobUrl}`);
    return cachedBlobUrl;
  }
  
  // Try to create a new URL
  try {
    // Get the CDN URL as a fallback
    await downloadWasmFile('tesseract-core.wasm');
    
    // If download succeeded, we should have a blob URL now
    const newBlobUrl = createWasmBlobUrl();
    if (newBlobUrl) {
      return newBlobUrl;
    }
    
    // If still no blob URL, use the default path
    return createAbsoluteUrl(defaultPath);
  } catch (error) {
    console.error('Error resolving WASM URL:', error);
    return createAbsoluteUrl(defaultPath);
  }
};

/**
 * Create a blob URL for worker script to avoid CORS issues
 */
export const createWorkerBlobURL = async (workerPath: string): Promise<string> => {
  if (!isBrowser) return workerPath;
  
  try {
    const absoluteUrl = createAbsoluteUrl(workerPath);
    console.log(`Fetching worker script from: ${absoluteUrl}`);
    
    const response = await fetch(absoluteUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch worker script: ${response.status}`);
    }
    
    const text = await response.text();
    const blob = new Blob([text], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    console.log(`Created worker blob URL: ${url}`);
    return url;
  } catch (error) {
    console.error('Error creating worker blob URL:', error);
    return workerPath;
  }
};

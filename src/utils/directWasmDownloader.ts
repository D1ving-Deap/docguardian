
/**
 * Direct WASM downloader utility to fetch WebAssembly files from trusted sources
 */
export const downloadWasmFile = async (destination: string): Promise<boolean> => {
  try {
    console.log('Starting direct WASM download process for:', destination);
    
    // List of reliable sources for tesseract-core.wasm
    const wasmSources = [
      'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
      'https://cdn.jsdelivr.net/npm/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
      'https://raw.githubusercontent.com/zliide/tesseract-wasm/master/dist/tesseract-core.wasm',
      'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract-core.wasm',
      // Add local paths as fallbacks
      '/tessdata/tesseract-core.wasm',
      '/tesseract-core.wasm',
      '/public/tessdata/tesseract-core.wasm',
      '/public/tesseract-core.wasm'
    ];
    
    // Check if the WASM file is already cached
    const cachedFile = sessionStorage.getItem('ocr-wasm-binary');
    if (cachedFile) {
      console.log('WASM file already cached in session storage');
      return true;
    }
    
    const cachedPath = sessionStorage.getItem('ocr-wasm-path');
    if (cachedPath && cachedPath.startsWith('blob:')) {
      console.log('WASM blob URL already cached:', cachedPath);
      return true;
    }
    
    // Try each source until one works
    for (const source of wasmSources) {
      try {
        console.log(`Downloading from ${source}...`);
        
        // Add a cache-busting parameter to avoid cached responses
        const url = new URL(source, window.location.origin);
        url.searchParams.append('t', Date.now().toString());
        
        console.log(`Fetching from URL: ${url.toString()}`);
        
        const response = await fetch(url.toString(), { 
          method: 'GET',
          cache: 'no-cache',
          credentials: 'omit',
          headers: {
            'Accept': 'application/wasm,*/*'
          }
        });
        
        if (!response.ok) {
          console.warn(`Failed to download from ${source}: ${response.status} ${response.statusText}`);
          continue;
        }
        
        // Get the binary data
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        console.log(`Downloaded ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB from ${source}`);
        
        // Verify that this is actually a valid WASM file (check magic bytes)
        if (bytes.length < 4 || 
            bytes[0] !== 0x00 || 
            bytes[1] !== 0x61 || 
            bytes[2] !== 0x73 || 
            bytes[3] !== 0x6D) {
          console.warn(`Invalid WASM file from ${source}. Header: ${
            bytes[0].toString(16).padStart(2, '0')} ${
            bytes[1].toString(16).padStart(2, '0')} ${
            bytes[2].toString(16).padStart(2, '0')} ${
            bytes[3].toString(16).padStart(2, '0')}`);
            
          // If it looks like an HTML error page, log the beginning
          if (bytes[0] === 0x3C) { // '<'
            const decoder = new TextDecoder();
            console.warn('Response appears to be HTML, not WASM:', decoder.decode(bytes.slice(0, 100)));
          }
          
          continue;
        }
        
        console.log(`✅ Valid WASM file downloaded from ${source}, size: ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB`);
        
        // Create a blob URL for the WASM data
        try {
          const blob = new Blob([arrayBuffer], { type: 'application/wasm' });
          const blobUrl = URL.createObjectURL(blob);
          sessionStorage.setItem('ocr-wasm-path', blobUrl);
          sessionStorage.setItem('ocr-wasm-source', source);
          console.log('Created blob URL for WASM file:', blobUrl);
        } catch (blobError) {
          console.error('Failed to create blob URL:', blobError);
        }
        
        // Also try to store the binary data for redundancy
        try {
          sessionStorage.setItem('ocr-wasm-binary', arrayBufferToBase64(arrayBuffer));
          console.log('WASM binary data cached in session storage');
        } catch (storageError) {
          console.warn('Could not store WASM binary in session storage (likely too large):', storageError);
          // We already created the blob URL above, so this is just a warning
        }
        
        return true;
      } catch (err) {
        console.error(`Error downloading from ${source}:`, err);
      }
    }
    
    // All sources failed
    console.error('⚠️ All WASM download sources failed');
    return false;
  } catch (error) {
    console.error('Direct WASM download failed:', error);
    return false;
  }
};

// Helper function to convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  try {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    console.error('Error converting ArrayBuffer to Base64:', error);
    throw error;
  }
};

// Helper function to convert Base64 string to ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  try {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error('Error converting Base64 to ArrayBuffer:', error);
    throw error;
  }
};

// Create a Blob URL from cached WASM data
export const createWasmBlobUrl = (): string | null => {
  try {
    // Check for existing blob URL first
    const existingBlobUrl = sessionStorage.getItem('ocr-wasm-path');
    if (existingBlobUrl && existingBlobUrl.startsWith('blob:')) {
      return existingBlobUrl;
    }
    
    // Otherwise try to create one from the cached binary data
    const wasmBase64 = sessionStorage.getItem('ocr-wasm-binary');
    if (!wasmBase64) return null;
    
    const wasmBuffer = base64ToArrayBuffer(wasmBase64);
    const wasmBlob = new Blob([wasmBuffer], { type: 'application/wasm' });
    const blobUrl = URL.createObjectURL(wasmBlob);
    
    // Store the blob URL for future reference
    sessionStorage.setItem('ocr-wasm-path', blobUrl);
    
    return blobUrl;
  } catch (error) {
    console.error('Failed to create WASM blob URL:', error);
    return null;
  }
};

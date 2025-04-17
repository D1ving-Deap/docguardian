/**
 * Direct WASM downloader utility to fetch WebAssembly files from trusted sources
 */
export const downloadWasmFile = async (destination: string): Promise<boolean> => {
  try {
    console.log('Starting direct WASM download process for:', destination);
    
    // List of reliable sources for tesseract-core.wasm with base URL support for production
    const baseUrl = window.location.origin;
    console.log('Current base URL:', baseUrl);
    
    // Get current path segments to correctly handle subdirectories
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    // For routes like /dashboard, we need to ensure we're looking at the root
    // Remove dashboard or other route names from consideration
    const validSegments = pathSegments.filter(segment => 
      !['dashboard', 'login', 'register', 'verify', 'reset'].includes(segment)
    );
    
    const basePath = validSegments.length > 0 ? `/${validSegments[0]}` : '';
    console.log('Base path:', basePath);
    
    // Create absolute paths based on current location
    const absolutePath = (path: string) => {
      if (path.startsWith('http')) return path;  // Already absolute
      if (path.startsWith('/')) return `${baseUrl}${path}`;  // Root-relative
      return `${baseUrl}${basePath ? basePath : ''}/${path}`;  // Document-relative
    };
    
    const wasmSources = [
      // Local paths with absolute URLs - highest priority
      `${baseUrl}/tessdata/tesseract-core.wasm`,
      // Alternate local paths - second priority
      `${baseUrl}/tesseract-core.wasm`,
      // Asset folder paths - third priority
      `${baseUrl}/assets/tessdata/tesseract-core.wasm`,
      `${baseUrl}/assets/tesseract-core.wasm`,
      // Static folder paths for various frameworks - fourth priority
      `${baseUrl}/static/tessdata/tesseract-core.wasm`,
      `${baseUrl}/static/tesseract-core.wasm`,
      // Public folder explicit paths - fifth priority
      `${baseUrl}/public/tessdata/tesseract-core.wasm`,
      `${baseUrl}/public/tesseract-core.wasm`,
      // Then try CDN sources as last resort
      'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
      'https://cdn.jsdelivr.net/npm/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
      'https://raw.githubusercontent.com/zliide/tesseract-wasm/master/dist/tesseract-core.wasm',
      'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract-core.wasm'
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
        console.log(`Attempting download from ${source}...`);
        
        // Add a cache-busting parameter to avoid cached responses
        const url = new URL(source);
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
        
        // Now that we have WASM, also download training data
        await downloadTrainingData();
        
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

/**
 * Downloads training data file from various sources
 */
export const downloadTrainingData = async (): Promise<boolean> => {
  try {
    console.log('Starting training data download...');
    
    // Get current base URL from the window location
    const baseUrl = window.location.origin;
    
    // Get current path segments to correctly handle subdirectories
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    // For routes like /dashboard, we need to ensure we're looking at the root
    // Remove dashboard or other route names from consideration
    const validSegments = pathSegments.filter(segment => 
      !['dashboard', 'login', 'register', 'verify', 'reset'].includes(segment)
    );
    
    const basePath = validSegments.length > 0 ? `/${validSegments[0]}` : '';
    
    // List of reliable sources for eng.traineddata
    const trainingDataSources = [
      // Local paths with absolute URLs - highest priority
      `${baseUrl}/tessdata/eng.traineddata`,
      // Root-level paths - second priority
      `${baseUrl}/eng.traineddata`,
      // CDN sources as reliable fallbacks - third priority
      'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata',
      'https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/eng.traineddata',
      // Asset folder paths - fourth priority
      `${baseUrl}/assets/tessdata/eng.traineddata`,
      `${baseUrl}/assets/eng.traineddata`,
      // Static folder paths - fifth priority
      `${baseUrl}/static/tessdata/eng.traineddata`,
      `${baseUrl}/static/eng.traineddata`,
      // Public folder explicit paths - sixth priority
      `${baseUrl}/public/tessdata/eng.traineddata`,
      `${baseUrl}/public/eng.traineddata`
    ];
    
    // Check if already cached
    const cachedTrainingData = sessionStorage.getItem('ocr-training-data-path');
    if (cachedTrainingData) {
      console.log('Training data path already cached:', cachedTrainingData);
      return true;
    }
    
    // Try each source until one works
    for (const source of trainingDataSources) {
      try {
        console.log(`Trying training data source: ${source}`);
        
        // Add cache busting
        const url = new URL(source);
        url.searchParams.append('t', Date.now().toString());
        
        // First use HEAD to check if exists (faster than getting the whole file)
        const headResponse = await fetch(url.toString(), { 
          method: 'HEAD',
          cache: 'no-store'
        });
        
        if (!headResponse.ok) {
          console.warn(`Training data not available at ${source}: ${headResponse.status}`);
          continue;
        }
        
        // Try to actually download a small part to verify it's accessible
        try {
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Range': 'bytes=0-1023' // Only get first KB to check if it's valid
            }
          });
          
          if (!response.ok) {
            console.warn(`Failed to download training data from ${source}: ${response.status}`);
            continue;
          }
          
          const buffer = await response.arrayBuffer();
          if (buffer.byteLength > 0) {
            console.log(`✅ Found valid training data at ${source} (verified ${buffer.byteLength} bytes)`);
            sessionStorage.setItem('ocr-training-data-path', source);
            return true;
          }
        } catch (downloadError) {
          console.warn(`Error verifying training data at ${source}:`, downloadError);
          continue;
        }
      } catch (err) {
        console.error(`Error checking training data at ${source}:`, err);
      }
    }
    
    // GitHub raw content fallback as last resort
    try {
      const githubSourceUrl = 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata';
      console.log('Trying GitHub raw content as last resort:', githubSourceUrl);
      sessionStorage.setItem('ocr-training-data-path', githubSourceUrl);
      return true;
    } catch (error) {
      console.error('Error setting GitHub fallback:', error);
    }
    
    return false;
  } catch (error) {
    console.error('Training data download failed:', error);
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

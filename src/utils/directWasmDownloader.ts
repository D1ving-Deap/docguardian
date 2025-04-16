
/**
 * Direct WASM downloader utility to fetch WebAssembly files from trusted sources
 */
export const downloadWasmFile = async (destination: string): Promise<boolean> => {
  try {
    // List of reliable sources for tesseract-core.wasm
    const wasmSources = [
      'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
      'https://cdn.jsdelivr.net/npm/tesseract-wasm@0.10.0/dist/tesseract-core.wasm',
      'https://raw.githubusercontent.com/zliide/tesseract-wasm/master/dist/tesseract-core.wasm'
    ];
    
    console.log('Attempting direct WASM download...');
    
    // Try each source until one works
    for (const source of wasmSources) {
      try {
        console.log(`Downloading from ${source}...`);
        const response = await fetch(source, { 
          method: 'GET',
          cache: 'no-cache',
          mode: 'cors' 
        });
        
        if (!response.ok) {
          console.warn(`Failed to download from ${source}: ${response.status}`);
          continue;
        }
        
        // Get the binary data
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Verify that this is actually a valid WASM file (check magic bytes)
        if (bytes.length < 4 || 
            bytes[0] !== 0x00 || 
            bytes[1] !== 0x61 || 
            bytes[2] !== 0x73 || 
            bytes[3] !== 0x6D) {
          console.warn(`Invalid WASM file from ${source}`);
          continue;
        }
        
        // Store the valid WASM file in browser cache
        console.log('Valid WASM file downloaded, storing in cache...');
        sessionStorage.setItem('ocr-wasm-binary', arrayBufferToBase64(arrayBuffer));
        sessionStorage.setItem('ocr-wasm-source', source);
        return true;
      } catch (err) {
        console.error(`Error downloading from ${source}:`, err);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Direct WASM download failed:', error);
    return false;
  }
};

// Helper function to convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Helper function to convert Base64 string to ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Create a Blob URL from cached WASM data
export const createWasmBlobUrl = (): string | null => {
  try {
    const wasmBase64 = sessionStorage.getItem('ocr-wasm-binary');
    if (!wasmBase64) return null;
    
    const wasmBuffer = base64ToArrayBuffer(wasmBase64);
    const wasmBlob = new Blob([wasmBuffer], { type: 'application/wasm' });
    return URL.createObjectURL(wasmBlob);
  } catch (error) {
    console.error('Failed to create WASM blob URL:', error);
    return null;
  }
};

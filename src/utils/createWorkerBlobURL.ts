
/**
 * Creates a Blob URL for a web worker script, patching any importScripts() calls
 * to use absolute paths to ensure correct resolution regardless of the page URL.
 */
export const createWorkerBlobURL = async (scriptPath: string): Promise<string> => {
  try {
    console.log(`Fetching worker script from: ${scriptPath}`);
    const response = await fetch(scriptPath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch worker script: ${scriptPath} (${response.status})`);
    }
    
    const js = await response.text();
    console.log(`Worker script fetched, length: ${js.length} bytes`);
    
    // Rewrite importScripts calls to use absolute paths
    const patched = js.replace(
      /importScripts\((["'])(.*?)\1\)/g, 
      (_, quote, src) => {
        // For .wasm files, always use the absolute path to root directory
        if (src.includes('.wasm')) {
          const absolutePath = `${window.location.origin}/tesseract-core.wasm`;
          console.log(`Patching importScripts for WASM: ${src} → ${absolutePath}`);
          return `importScripts("${absolutePath}")`;
        }
        
        // For other imports, prefix with root path if they don't have a full URL
        if (!src.startsWith('http') && !src.startsWith('/')) {
          const absolutePath = `${window.location.origin}/${src}`;
          console.log(`Patching importScripts: ${src} → ${absolutePath}`);
          return `importScripts("${absolutePath}")`;
        }
        
        return `importScripts(${quote}${src}${quote})`;
      }
    );
    
    // Create blob URL from the patched script
    const blob = new Blob([patched], { type: 'application/javascript' });
    const blobURL = URL.createObjectURL(blob);
    console.log(`Created fresh worker blob URL: ${blobURL}`);
    
    // Store the source path for debugging, but not the blob URL
    try {
      sessionStorage.setItem('ocr-worker-source', scriptPath);
    } catch (storageError) {
      console.warn('Failed to store worker source in session storage:', storageError);
    }
    
    return blobURL;
  } catch (error) {
    console.error('Error creating worker blob URL:', error);
    throw error;
  }
};

// Note: getCachedWorkerBlobURL is removed since we always want fresh blobs


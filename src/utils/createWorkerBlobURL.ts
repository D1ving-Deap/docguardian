
/**
 * Creates a blob URL for a worker script
 * @param src Source path for the worker script
 * @returns Promise resolving to the blob URL
 */
export const createWorkerBlobURL = async (src: string): Promise<string> => {
  try {
    // Check if source is already a blob URL
    if (src.startsWith('blob:')) {
      console.log('Worker source is already a blob URL:', src);
      return src;
    }
    
    // Always use absolute path to avoid issues with nested routes
    let absolutePath = src;
    if (!src.startsWith('http') && !src.startsWith('blob:')) {
      const baseOrigin = window.location.origin;
      const basePath = import.meta.env.BASE_URL || '/';
      
      // Handle different path formats
      if (src.startsWith('/')) {
        // Remove first slash to avoid double slashes
        absolutePath = `${baseOrigin}${src}`;
      } else {
        // Add base path for relative paths
        absolutePath = `${baseOrigin}${basePath}${src}`;
      }
    }

    console.log(`Fetching worker from: ${absolutePath}`);
    
    // Add a cache-busting parameter to avoid caching issues
    const urlWithCacheBust = new URL(absolutePath);
    urlWithCacheBust.searchParams.append('t', Date.now().toString());
    
    const response = await fetch(urlWithCacheBust.toString(), {
      cache: 'no-cache' // Force fresh fetch
    });
    
    if (!response.ok) {
      const errorMessage = `Failed to fetch worker script: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      
      // Try a fallback approach for development environments
      if (import.meta.env.DEV) {
        console.log('Trying fallback worker path for development...');
        const fallbackPath = `/node_modules/tesseract-wasm/dist/tesseract-worker.js`;
        const fallbackUrl = `${window.location.origin}${fallbackPath}`;
        
        console.log(`Trying fallback: ${fallbackUrl}`);
        const fallbackResponse = await fetch(fallbackUrl);
        
        if (fallbackResponse.ok) {
          const workerText = await fallbackResponse.text();
          const blob = new Blob([workerText], { type: 'application/javascript' });
          const blobURL = URL.createObjectURL(blob);
          console.log(`Worker blob URL created from fallback: ${blobURL}`);
          return blobURL;
        }
        
        console.error('Fallback approach also failed');
      }
      
      throw new Error(errorMessage);
    }
    
    const workerText = await response.text();
    const blob = new Blob([workerText], { type: 'application/javascript' });
    const blobURL = URL.createObjectURL(blob);
    
    console.log(`Worker blob URL created: ${blobURL} (from ${absolutePath})`);
    return blobURL;
  } catch (error) {
    console.error('Error creating worker blob URL:', error);
    throw new Error(`Failed to create worker blob URL: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Creates a Tesseract worker from a blob URL
 * @param workerPath Path to the worker script
 * @returns Promise resolving to a Worker instance
 */
export const createTesseractWorker = async (workerPath?: string): Promise<Worker> => {
  try {
    // Determine the best worker path to use
    let effectiveWorkerPath = workerPath;
    
    if (!effectiveWorkerPath) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      // Try multiple path options to locate the worker file
      const possiblePaths = [
        '/tessdata/tesseract-worker.js',
        `${baseUrl}tessdata/tesseract-worker.js`,
        '/assets/tesseract-worker.js',
        `${baseUrl}assets/tesseract-worker.js`
      ];
      
      // Use the first path that resolves successfully
      for (const path of possiblePaths) {
        try {
          const checkResponse = await fetch(path, { method: 'HEAD' });
          if (checkResponse.ok) {
            console.log(`Found worker at: ${path}`);
            effectiveWorkerPath = path;
            break;
          }
        } catch (e) {
          console.log(`Worker not found at: ${path}`);
        }
      }
      
      // If still not found, use default path
      if (!effectiveWorkerPath) {
        effectiveWorkerPath = '/tessdata/tesseract-worker.js';
        console.log(`Using default worker path: ${effectiveWorkerPath}`);
      }
    }
    
    // If already a blob URL, use it directly, otherwise create one
    const workerURL = effectiveWorkerPath.startsWith('blob:')
      ? effectiveWorkerPath
      : await createWorkerBlobURL(effectiveWorkerPath);
    
    console.log('Creating worker from:', workerURL);
    return new Worker(workerURL);
  } catch (error) {
    console.error('Error creating tesseract worker:', error);
    throw new Error(`Failed to create tesseract worker: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Resolves a WASM file URL with proper error handling
 * @param wasmPath Path to the WASM file
 * @returns Promise resolving to the absolute URL of the WASM file
 */
export const resolveWasmUrl = async (wasmPath?: string): Promise<string> => {
  try {
    if (!wasmPath) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      wasmPath = `${baseUrl}tessdata/tesseract-core.wasm`;
    }
    
    // If it's already a blob URL, return it directly
    if (wasmPath.startsWith('blob:')) {
      return wasmPath;
    }
    
    // Make sure we're using an absolute path
    let absoluteWasmPath = wasmPath;
    if (!wasmPath.startsWith('http') && !wasmPath.startsWith('blob:')) {
      const baseOrigin = window.location.origin;
      const basePath = import.meta.env.BASE_URL || '/';
      
      // Handle different path formats
      if (wasmPath.startsWith('/')) {
        absoluteWasmPath = `${baseOrigin}${wasmPath}`;
      } else {
        absoluteWasmPath = `${baseOrigin}${basePath}${wasmPath}`;
      }
    }
    
    // Check if the file exists
    try {
      const checkResponse = await fetch(absoluteWasmPath, { method: 'HEAD' });
      if (!checkResponse.ok) {
        console.warn(`WASM file not found at ${absoluteWasmPath}, status: ${checkResponse.status}`);
        
        // Try some fallback paths
        const fallbackPaths = [
          `${window.location.origin}/tessdata/tesseract-core.wasm`,
          `${window.location.origin}/tesseract-core.wasm`,
          `${window.location.origin}/assets/tesseract-core.wasm`
        ];
        
        for (const fallbackPath of fallbackPaths) {
          console.log(`Trying fallback WASM path: ${fallbackPath}`);
          const fallbackResponse = await fetch(fallbackPath, { method: 'HEAD' });
          if (fallbackResponse.ok) {
            console.log(`Found WASM file at fallback path: ${fallbackPath}`);
            return fallbackPath;
          }
        }
        
        // If still not found, check if we can access it directly from node_modules in dev mode
        if (import.meta.env.DEV) {
          const nodeModulesPath = `${window.location.origin}/node_modules/tesseract-wasm/dist/tesseract-core.wasm`;
          console.log(`Trying node_modules WASM path: ${nodeModulesPath}`);
          const nodeModulesResponse = await fetch(nodeModulesPath, { method: 'HEAD' });
          if (nodeModulesResponse.ok) {
            console.log(`Found WASM file in node_modules: ${nodeModulesPath}`);
            return nodeModulesPath;
          }
        }
      }
    } catch (error) {
      console.warn(`Error checking WASM file at ${absoluteWasmPath}:`, error);
    }
    
    // Return the original resolved path for the calling code to handle as needed
    console.log(`Using WASM path: ${absoluteWasmPath}`);
    return absoluteWasmPath;
  } catch (error) {
    console.error('Error resolving WASM URL:', error);
    throw new Error(`Failed to resolve WASM URL: ${error instanceof Error ? error.message : String(error)}`);
  }
};

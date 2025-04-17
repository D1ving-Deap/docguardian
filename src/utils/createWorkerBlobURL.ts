
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
    
    // Use absolute path to avoid issues with nested routes
    let absolutePath = src;
    if (!src.startsWith('http') && !src.startsWith('blob:')) {
      const baseOrigin = window.location.origin;
      absolutePath = src.startsWith('/') 
        ? `${baseOrigin}${src}` 
        : `${baseOrigin}/${src}`;
    }

    console.log(`Fetching worker from: ${absolutePath}`);
    const response = await fetch(absolutePath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch worker script: ${response.status} ${response.statusText}`);
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
    const isBlob = workerPath?.startsWith('blob:');
    
    // Log for debugging
    console.log('Worker path type:', isBlob ? 'blob' : 'file path');
    
    // If already a blob URL, use it directly, otherwise create one
    const workerURL = isBlob
      ? workerPath
      : await createWorkerBlobURL(workerPath || '/tessdata/tesseract-worker.js');
    
    console.log('Creating worker from:', workerURL);
    return new Worker(workerURL);
  } catch (error) {
    console.error('Error creating tesseract worker:', error);
    throw new Error(`Failed to create tesseract worker: ${error instanceof Error ? error.message : String(error)}`);
  }
};

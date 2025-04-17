
import { createWorkerBlobURL, getCachedWorkerBlobURL } from './createWorkerBlobURL';

/**
 * Creates a Tesseract Web Worker from a Blob to avoid MIME type and CORS issues
 * This approach loads the worker script in memory and creates a blob URL
 */
export const createTesseractWorker = async (workerPath?: string): Promise<Worker> => {
  try {
    // First check if we have a cached blob URL from a previous session
    const cachedBlobURL = getCachedWorkerBlobURL();
    if (cachedBlobURL) {
      console.log('Using cached worker blob URL:', cachedBlobURL);
      try {
        return new Worker(cachedBlobURL);
      } catch (cachedWorkerError) {
        console.warn('Failed to create worker from cached blob URL:', cachedWorkerError);
        // Continue to fetch a fresh copy if cached fails
      }
    }
    
    // Use provided path or default
    const workerURL = workerPath || '/tesseract-worker.js';
    console.log('Creating tesseract worker from path:', workerURL);
    
    // Create a blob URL with path correction for imports
    const blobURL = await createWorkerBlobURL(workerURL);
    
    // Create and return the worker using the blob URL
    console.log('Creating worker from blob URL:', blobURL);
    return new Worker(blobURL);
  } catch (error) {
    console.error('Error creating tesseract worker:', error);
    throw new Error(`Failed to create tesseract worker: ${error instanceof Error ? error.message : String(error)}`);
  }
};

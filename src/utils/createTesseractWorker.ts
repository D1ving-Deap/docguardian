
import { createWorkerBlobURL } from './createWorkerBlobURL';

/**
 * Creates a Tesseract Web Worker from a Blob to avoid MIME type and CORS issues
 * This approach loads the worker script in memory and creates a blob URL
 */
export const createTesseractWorker = async (workerPath?: string): Promise<Worker> => {
  try {
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

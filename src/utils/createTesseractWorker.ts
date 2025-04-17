import { createWorkerBlobURL } from './createWorkerBlobURL';

/**
 * Creates a Tesseract Web Worker from a Blob to avoid MIME type and CORS issues
 * This approach loads the worker script in memory and creates a blob URL
 */
export const createTesseractWorker = async (workerPath?: string): Promise<Worker> => {
  try {
    // Check if the workerPath is already a blob URL
    const isBlob = workerPath?.startsWith('blob:');
    
    // Use provided path or default
    if (isBlob) {
      console.log('Worker path type: blob, using directly:', workerPath);
      return new Worker(workerPath);
    }
    
    // Otherwise, create a blob URL from the path
    const workerURL = workerPath || '/tesseract-worker.js';
    console.log('Creating tesseract worker from path (not blob):', workerURL);
    console.log('Worker path type: file');
    
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

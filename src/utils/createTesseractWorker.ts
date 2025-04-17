
/**
 * Creates a Tesseract Web Worker from a Blob to avoid MIME type and CORS issues
 * This approach loads the worker script in memory and creates a blob URL
 */
export const createTesseractWorker = async (workerPath?: string): Promise<Worker> => {
  try {
    // Use provided path or default
    const workerURL = workerPath || '/tessdata/tesseract-worker.js';
    console.log('Fetching worker script from:', workerURL);

    // Fetch the worker script
    const response = await fetch(workerURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch worker script: ${workerURL} (${response.status})`);
    }

    // Create a blob from the script content
    const js = await response.text();
    const blob = new Blob([js], { type: 'application/javascript' });
    const blobURL = URL.createObjectURL(blob);
    
    console.log('Created blob URL for worker:', blobURL);
    
    // Create and return the worker
    return new Worker(blobURL);
  } catch (error) {
    console.error('Error creating tesseract worker from blob:', error);
    throw error;
  }
};

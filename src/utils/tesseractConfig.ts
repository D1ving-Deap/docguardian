
import { OCRClient } from 'tesseract-wasm';

// Configure paths to WASM files and training data
export const TESSERACT_CONFIG = {
  workerPath: '/tessdata/tesseract-worker.js',
  corePath: '/tessdata/tesseract-core.wasm',
  trainingDataPath: '/tessdata/eng.traineddata'
};

// Initialize OCR client with configuration
export const createOCRClient = async (
  options: {
    logger?: (message: any) => void;
    progressCallback?: (progress: number) => void;
  } = {}
): Promise<OCRClient> => {
  try {
    console.log('Setting up OCR client configuration...');
    const config = {
      workerPath: TESSERACT_CONFIG.workerPath,
      corePath: TESSERACT_CONFIG.corePath,
      logger: options.logger || ((message: any) => {
        console.log('Tesseract message:', message);
        if (message.status === 'recognizing text' && options.progressCallback) {
          options.progressCallback(message.progress || 0);
        }
      })
    };

    console.log('Initializing OCR client with config:', config);
    const client = new OCRClient(config);
    
    console.log('Loading OCR model from:', TESSERACT_CONFIG.trainingDataPath);
    await client.loadModel(TESSERACT_CONFIG.trainingDataPath);
    console.log('OCR model loaded successfully');
    
    return client;
  } catch (error) {
    console.error('Error initializing OCR client:', error);
    throw new Error(`Failed to initialize OCR client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

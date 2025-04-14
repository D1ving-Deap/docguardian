
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
  } = {}
): Promise<OCRClient> => {
  const config = {
    workerPath: TESSERACT_CONFIG.workerPath,
    corePath: TESSERACT_CONFIG.corePath,
    logger: options.logger
  };

  console.log('Initializing OCR client with config:', config);
  const client = new OCRClient(config);
  
  console.log('Loading OCR model from:', TESSERACT_CONFIG.trainingDataPath);
  await client.loadModel(TESSERACT_CONFIG.trainingDataPath);
  
  return client;
};

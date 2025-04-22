import { useState, useCallback } from 'react';
import { performOCR } from '@/utils/tesseractOCR';
import { extractFields } from '@/utils/ocrService';
import { DocumentAnalysisResult, ExtractedFields } from '@/utils/ocrService';

interface OCRProcessingConfig {
  applicationId?: string;
  documentType?: string;
  onSuccess: (result: DocumentAnalysisResult) => void;
  onError: (error: Error) => void;
}

export const useOCRProcessing = (config: OCRProcessingConfig) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProcessingStage('');
    setProgress(0);
    setError(null);
  }, []);

  const processDocument = async (file: File) => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setProcessingStage('initializing');
    setError(null);
    
    try {
      // Step 1: Extract text using OCR
      setProcessingStage('extracting');
      
      const ocrOptions = {
        progressCallback: (progress: number) => {
          setProgress(progress * 0.7); // OCR is 70% of the process
        },
        logger: console.log
      };
      
      const ocrResult = await performOCR(file, ocrOptions);
      
      // Step 2: Extract structured data
      setProcessingStage('analyzing');
      setProgress(70);
      
      const extractedFields: ExtractedFields = await extractFields(ocrResult.text, config.documentType);
      setProgress(85);
      
      // Step 3: Validate and analyze the extracted data
      setProcessingStage('validating');
      setProgress(90);
      
      // Simulate document ID generation
      const documentId = `doc-${Date.now()}`;
      
      // Simulate issues detection
      const issues = [];
      if (extractedFields && extractedFields.name && extractedFields.name.length < 3) {
        issues.push({ severity: 'warning', message: 'Name is too short' });
      }
      
      setProgress(100);
      
      // Step 4: Report success
      config.onSuccess({
        documentId: documentId,
        text: ocrResult.text,
        extractedFields: extractedFields,
        issues: issues
      });
    } catch (error: any) {
      console.error('Document processing error:', error);
      setError(error);
      config.onError(error);
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
      setProgress(0);
    }
  };
  
  return {
    isProcessing,
    processingStage,
    progress,
    error,
    processDocument,
    reset
  };
};

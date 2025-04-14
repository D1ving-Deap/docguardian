
import { useState } from 'react';
import { performOCR, extractFieldsFromText, analyzeForIssues, ExtractedFields } from '@/utils/ocrService';
import { supabase } from "@/integrations/supabase/client";

interface OCRProcessingResult {
  documentId: string;
  text: string;
  extractedFields: ExtractedFields;
  issues: Array<{ severity: string; message: string }>;
  confidence: number;
}

interface UseOCRProcessingOptions {
  applicationId?: string;
  documentType: string;
  onSuccess?: (result: OCRProcessingResult) => void;
  onError?: (error: Error) => void;
}

export const useOCRProcessing = ({
  applicationId,
  documentType,
  onSuccess,
  onError
}: UseOCRProcessingOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OCRProcessingResult | null>(null);
  
  const processDocument = async (file: File) => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      setProcessingStage('Initializing OCR engine...');
      setProgress(5);
      
      // Run OCR on the file
      const ocrResult = await performOCR(file, (progress) => {
        setProgress(Math.floor(progress * 70) + 10); // Scale progress from 10-80%
        setProcessingStage(`Processing document: ${Math.floor(progress * 100)}%`);
      });
      
      setProcessingStage('Extracting structured data...');
      setProgress(85);
      
      // Extract fields from the OCR text
      const extractedFields = extractFieldsFromText(ocrResult.text, documentType);
      
      // Analyze for potential issues
      const issues = analyzeForIssues(extractedFields, documentType);
      
      // If we have an applicationId, save to Supabase
      let documentId = 'demo-' + Date.now();
      
      if (applicationId) {
        setProcessingStage('Uploading document...');
        setProgress(90);
        
        const timestamp = new Date().getTime();
        const safeName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.-]/g, '_'));
        const filePath = `${applicationId}/${documentType}/${timestamp}_${safeName}`;
        
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const { data: storageData, error: storageError } = await supabase.storage
          .from('applications')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });
        
        if (storageError) {
          throw new Error(`Storage error: ${storageError.message}`);
        }
        
        setProcessingStage('Saving document information...');
        setProgress(95);
        
        // Save document metadata to database
        documentId = crypto.randomUUID();
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            id: documentId,
            application_id: applicationId,
            document_type: documentType,
            filename: file.name,
            file_path: filePath,
            raw_text: ocrResult.text,
            structured_data: extractedFields,
            verified: false
          })
          .select();
        
        if (docError) {
          console.error('Error storing document metadata:', docError);
          throw new Error(`Database error: ${docError.message}`);
        }
        
        // Save any detected issues to fraud_alerts table
        if (issues.length > 0) {
          const alertPromises = issues.map(issue => 
            supabase.from('fraud_alerts').insert({
              document_id: documentId,
              issue: issue.message,
              severity: issue.severity,
              resolved: false
            })
          );
          
          await Promise.all(alertPromises);
        }
      }
      
      setProcessingStage('Processing complete');
      setProgress(100);
      
      // Prepare final result
      const processingResult: OCRProcessingResult = {
        documentId,
        text: ocrResult.text,
        extractedFields,
        issues,
        confidence: ocrResult.confidence
      };
      
      // Set result and call onSuccess
      setResult(processingResult);
      onSuccess?.(processingResult);
      
      return processingResult;
    } catch (error: any) {
      console.error('OCR processing error:', error);
      onError?.(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const reset = () => {
    setProgress(0);
    setProcessingStage('');
    setResult(null);
  };
  
  return {
    isProcessing,
    processingStage,
    progress,
    result,
    processDocument,
    reset
  };
};

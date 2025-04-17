import { useState } from 'react';
import { performOCR, extractFieldsFromText, analyzeForIssues, ExtractedFields } from '@/utils/ocrService';
import { supabase } from "@/integrations/supabase/client";
import { verifyOCRAssets, getVerificationErrorMessage, diagnoseOCRIssues, testWorkerInitialization } from '@/utils/ocrVerification';

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
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  
  const processDocument = async (file: File) => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      setProcessingStage('Checking browser compatibility...');
      setProgress(2);
      
      // First, run a test to see if Web Workers are functioning
      console.log('Testing Web Worker initialization...');
      const workerTest = await testWorkerInitialization();
      if (!workerTest.success) {
        console.warn('Worker initialization test failed:', workerTest.error);
        // Continue anyway, but log the warning
      }
      
      setProcessingStage('Verifying OCR engine assets...');
      setProgress(5);
      
      // Verify the OCR assets before processing with enhanced error handling
      const verificationResult = await verifyOCRAssets();
      setDiagnosticInfo(verificationResult.browserInfo);
      
      // Log detailed browser information
      console.log('Browser information:', verificationResult.browserInfo);
      
      // Even if verification fails, we'll try to proceed with the paths that were found
      if (!verificationResult.success) {
        console.warn('OCR asset verification failed, but will attempt to proceed:', 
          verificationResult.message);
          
        // Store diagnostic information for debugging
        const diagnosis = await diagnoseOCRIssues();
        setDiagnosticInfo({...diagnosis, verification: verificationResult});
        console.warn('OCR diagnostic information:', diagnosis);
        
        // Display more user-friendly message based on what's missing
        setProcessingStage(`Warning: ${getVerificationErrorMessage(verificationResult.missingFiles)}. Attempting alternative approach...`);
      }
      
      setProcessingStage('Initializing WASM OCR engine...');
      setProgress(10);
      
      // Run OCR on the file with the WASM-based engine
      try {
        // Run OCR with more detailed progress tracking
        const ocrResult = await performOCR(
          file, 
          (progress) => {
            // Scale progress from 10-80%
            const scaledProgress = Math.floor(progress * 70) + 10;
            setProgress(scaledProgress); 
            setProcessingStage(`Processing document: ${Math.floor(progress * 100)}%`);
          }
        );
        
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
          documentId: documentId,
          text: ocrResult.text,
          extractedFields,
          issues,
          confidence: ocrResult.confidence
        };
        
        // Set result and call onSuccess
        setResult(processingResult);
        onSuccess?.(processingResult);
        
        return processingResult;
      } catch (ocrError) {
        console.error('OCR processing error:', ocrError);
        
        // Try a diagnostic run to get more information
        const diagnosis = await diagnoseOCRIssues();
        setDiagnosticInfo({
          ...diagnosticInfo,
          ocrDiagnosis: diagnosis,
          ocrError: ocrError instanceof Error ? ocrError.message : 'Unknown error'
        });
        
        throw ocrError; // Re-throw to be caught by the outer try/catch
      }
    } catch (error: any) {
      console.error('OCR processing error:', error);
      
      // Generate enhanced error message with diagnostic information
      let errorMessage = error.message || 'Unknown error occurred';
      
      // If we have diagnostic info, enhance the error message
      if (diagnosticInfo) {
        console.error('Diagnostic information:', diagnosticInfo);
        
        // Add browser information to error message if available
        if (diagnosticInfo.browserInfo) {
          const browserInfo = diagnosticInfo.browserInfo;
          const browser = browserInfo.isChrome ? 'Chrome' : 
                         browserInfo.isFirefox ? 'Firefox' : 
                         browserInfo.isEdge ? 'Edge' : 
                         browserInfo.isSafari ? 'Safari' : 'Unknown';
          
          errorMessage += ` Browser: ${browser}.`;
          
          if (browserInfo.isSafari && !errorMessage.includes('Safari')) {
            errorMessage += ' Safari has stricter WASM security policies and may require different configuration.';
          }
          
          if (browserInfo.isMobile && !errorMessage.includes('mobile')) {
            errorMessage += ' Mobile browsers may have limited WASM support.';
          }
        }
      }
      
      // If error message doesn't have specific details, try to get more specific
      if (!errorMessage.includes('Failed to') && !errorMessage.includes('Missing')) {
        // Run diagnostic to provide more helpful information
        try {
          const diagnosis = await diagnoseOCRIssues();
          setDiagnosticInfo({...diagnosticInfo, finalDiagnosis: diagnosis});
          
          // Add some helpful suggestions to the error message
          if (diagnosis.suggestions.length > 0) {
            errorMessage += ' Possible solution: ' + diagnosis.suggestions[0];
          }
          
          // Add CORS-specific advice if relevant
          if (diagnosis.corsIssues) {
            errorMessage += ' CORS issues detected - the application may not have permission to access required files.';
          }
          
          console.error('OCR diagnostic information:', diagnosis);
        } catch (diagError) {
          console.error('Failed to run diagnostics:', diagError);
        }
      }
      
      // Create error object with enhanced message
      const enhancedError = new Error(errorMessage);
      onError?.(enhancedError);
      throw enhancedError;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const reset = () => {
    setProgress(0);
    setProcessingStage('');
    setResult(null);
    setDiagnosticInfo(null);
  };
  
  return {
    isProcessing,
    processingStage,
    progress,
    result,
    diagnosticInfo,
    processDocument,
    reset
  };
};

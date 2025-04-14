
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, Loader2, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { performOCR, extractFieldsFromText, ExtractedFields } from '@/utils/ocrService';
import { supabase, supabaseUrl } from "@/integrations/supabase/client";
import storage from '@/utils/supabaseStorage';

interface VerifyFlowOCRProps {
  onProcessingComplete?: (result: {
    documentId: string;
    text: string;
    extractedFields: ExtractedFields;
    issues?: { severity: string; message: string }[];
  }) => void;
  documentType?: string;
  applicationId?: string;
}

const VerifyFlowOCR: React.FC<VerifyFlowOCRProps> = ({
  onProcessingComplete,
  documentType = 'generic',
  applicationId
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [ocrResult, setOcrResult] = useState<{
    documentId: string;
    extractedFields: ExtractedFields;
    issues?: { severity: string; message: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!selectedFile.type.includes('pdf') && 
          !selectedFile.type.includes('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file or image (JPG, PNG, TIFF)",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const runOCR = async () => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      setProcessingStage('Initializing OCR engine...');
      setProgress(5);
      
      // Run OCR on the file
      const result = await performOCR(file, (progress) => {
        setProgress(Math.floor(progress * 70) + 10); // Scale progress from 10-80%
        setProcessingStage(`Processing document: ${Math.floor(progress * 100)}%`);
      });
      
      setOcrText(result.text);
      setProcessingStage('Extracting structured data...');
      setProgress(85);
      
      // Extract fields from the OCR text
      const extractedFields = extractFieldsFromText(result.text, documentType);
      
      // If we have an applicationId, save to Supabase
      if (applicationId) {
        setProcessingStage('Uploading document...');
        setProgress(90);
        
        const timestamp = new Date().getTime();
        const safeName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.-]/g, '_'));
        const filePath = `${applicationId}/${documentType}/${timestamp}_${safeName}`;
        const uploadResult = await storage.uploadFile(
          file,
          'applications',
          filePath
        );
        
        if ('error' in uploadResult) {
          throw new Error(uploadResult.error);
        }
        
        setProcessingStage('Saving document information...');
        setProgress(95);
        
        const documentId = crypto.randomUUID();
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            id: documentId,
            application_id: applicationId,
            document_type: documentType,
            filename: file.name,
            file_path: uploadResult.key,
            raw_text: result.text,
            structured_data: extractedFields,
            verified: false
          })
          .select();
        
        if (docError) {
          console.error('Error storing document metadata:', docError);
          throw new Error(`Database error: ${docError.message}`);
        }
        
        setProcessingStage('Running fraud checks...');
        setProgress(98);
        
        // Simulate fraud check response
        setTimeout(() => {
          setProcessingStage('Processing complete');
          setProgress(100);
          
          const mockIssues = Math.random() > 0.7 ? [
            { severity: 'warning', message: 'Unusual income increase detected' }
          ] : undefined;
          
          setOcrResult({
            documentId,
            extractedFields,
            issues: mockIssues
          });
          
          if (onProcessingComplete) {
            onProcessingComplete({
              documentId,
              text: result.text,
              extractedFields,
              issues: mockIssues
            });
          }
          
          toast({
            title: "Document Processed",
            description: mockIssues 
              ? "Document processed with potential issues detected" 
              : "Document processed successfully",
            variant: mockIssues ? "destructive" : "default"
          });
          
          setIsProcessing(false);
        }, 1000);
      } else {
        // If no applicationId (demo mode)
        setProcessingStage('Processing complete');
        setProgress(100);
        
        setTimeout(() => {
          setOcrResult({
            documentId: 'demo-' + Date.now(),
            extractedFields
          });
          
          if (onProcessingComplete) {
            onProcessingComplete({
              documentId: 'demo-' + Date.now(),
              text: result.text,
              extractedFields
            });
          }
          
          toast({
            title: "Demo Document Processed",
            description: "OCR completed successfully in demo mode",
          });
          
          setIsProcessing(false);
        }, 1000);
      }
    } catch (error: any) {
      console.error('OCR processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process document",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  const reset = () => {
    setFile(null);
    setOcrText('');
    setOcrResult(null);
    setProgress(0);
    setProcessingStage('');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {!file ? (
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center m-4">
            <FileUp className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-center text-muted-foreground mb-4">
              Upload a document (PDF, JPG, PNG) for instant AI analysis
            </p>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/tiff"
              onChange={handleFileChange}
              className="hidden"
              id="ocr-file-upload"
            />
            <label htmlFor="ocr-file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Select Document</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
              </div>
              {!isProcessing && !ocrResult && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={reset}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              )}
            </div>
            
            {!ocrResult ? (
              <>
                {isProcessing ? (
                  <div className="space-y-3">
                    {processingStage && (
                      <p className="text-xs text-muted-foreground">{processingStage}</p>
                    )}
                    <Progress value={progress} className="h-2" />
                  </div>
                ) : (
                  <Button 
                    onClick={runOCR} 
                    className="w-full"
                  >
                    Process Document
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span>Document processed successfully</span>
                </div>
                
                {ocrResult.issues && ocrResult.issues.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <div className="flex items-center text-yellow-700 mb-1">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="font-medium text-sm">Potential Issues</span>
                    </div>
                    <ul className="text-xs text-yellow-800 pl-6 list-disc">
                      {ocrResult.issues.map((issue, i) => (
                        <li key={i}>{issue.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {ocrResult.extractedFields && Object.keys(ocrResult.extractedFields).length > 0 && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Extracted Information</h4>
                    <div className="space-y-1">
                      {Object.entries(ocrResult.extractedFields).map(([key, value]) => {
                        if (key === "metadata") return null;
                        return (
                          <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                            <span className="text-gray-500 col-span-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                            <span className="col-span-2 font-medium">{value as string}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    className="flex-1"
                  >
                    Process Another Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerifyFlowOCR;

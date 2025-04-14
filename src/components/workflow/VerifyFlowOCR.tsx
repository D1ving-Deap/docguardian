
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { useOCRProcessing } from '@/hooks/useOCRProcessing';
import { ExtractedFields } from '@/utils/ocrService';

// Import subcomponents
import DocumentUploader from './ocr/DocumentUploader';
import ProcessingStatus from './ocr/ProcessingStatus';
import ExtractedFieldsDisplay from './ocr/ExtractedFieldsDisplay';
import IssuesDisplay from './ocr/IssuesDisplay';

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
  const [ocrResult, setOcrResult] = useState<{
    documentId: string;
    extractedFields: ExtractedFields;
    issues?: { severity: string; message: string }[];
  } | null>(null);

  const {
    isProcessing,
    processingStage,
    progress,
    processDocument,
    reset: resetOCR
  } = useOCRProcessing({
    applicationId,
    documentType,
    onSuccess: (result) => {
      setOcrResult({
        documentId: result.documentId,
        extractedFields: result.extractedFields,
        issues: result.issues
      });
      
      if (onProcessingComplete) {
        onProcessingComplete({
          documentId: result.documentId,
          text: result.text,
          extractedFields: result.extractedFields,
          issues: result.issues
        });
      }
      
      toast({
        title: "Document Processed",
        description: result.issues.length > 0 
          ? "Document processed with potential issues detected" 
          : "Document processed successfully",
        variant: result.issues.length > 0 ? "destructive" : "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process document",
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (!newFile) {
      resetOCR();
      setOcrResult(null);
    }
  };

  const runOCR = async () => {
    if (!file) return;
    
    try {
      await processDocument(file);
    } catch (error: any) {
      console.error('OCR processing error:', error);
    }
  };
  
  const reset = () => {
    handleFileChange(null);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {!file ? (
          <DocumentUploader
            file={file}
            isProcessing={isProcessing}
            onFileChange={handleFileChange}
            onProcess={runOCR}
          />
        ) : (
          <div className="p-4 space-y-4">
            <DocumentUploader
              file={file}
              isProcessing={isProcessing}
              onFileChange={handleFileChange}
              onProcess={runOCR}
            />
            
            {!ocrResult ? (
              <ProcessingStatus
                isProcessing={isProcessing}
                processingStage={processingStage}
                progress={progress}
                onProcess={runOCR}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span>Document processed successfully</span>
                </div>
                
                <IssuesDisplay issues={ocrResult.issues || []} />
                
                <ExtractedFieldsDisplay extractedFields={ocrResult.extractedFields} />
                
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

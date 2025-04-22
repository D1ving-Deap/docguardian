
// This is a partial update to fix the OCR function calls
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, FileText, Table } from "lucide-react";
import { useOCRProcessing } from '@/hooks/useOCRProcessing';
import { ExtractedFields } from '@/utils/ocrService';

// Import subcomponents
import DocumentUploader from './ocr/DocumentUploader';
import ProcessingStatus from './ocr/ProcessingStatus';
import ExtractedFieldsDisplay from './ocr/ExtractedFieldsDisplay';
import IssuesDisplay from './ocr/IssuesDisplay';
import CategorizedDataTable from './ocr/CategorizedDataTable';

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
  const [rawText, setRawText] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<{
    documentId: string;
    extractedFields: ExtractedFields;
    issues?: { severity: string; message: string }[];
  } | null>(null);
  const [showCategorizedData, setShowCategorizedData] = useState<boolean>(false);

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
      setRawText(result.text);
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
      setRawText('');
      setShowCategorizedData(false);
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
  
  const toggleCategorizedView = () => {
    setShowCategorizedData(!showCategorizedData);
  };
  
  const downloadData = () => {
    if (!ocrResult?.extractedFields) return;
    
    // Convert extracted fields to CSV or JSON
    const jsonData = JSON.stringify(ocrResult.extractedFields, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${ocrResult.documentId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                
                <div className="flex space-x-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCategorizedView}
                    className="flex-1"
                  >
                    {showCategorizedData ? (
                      <>
                        <FileText className="h-4 w-4 mr-1" /> 
                        Show Extracted Fields
                      </>
                    ) : (
                      <>
                        <Table className="h-4 w-4 mr-1" /> 
                        Show Categorized Data
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadData}
                    className="flex-1"
                  >
                    Download Data
                  </Button>
                </div>
                
                {showCategorizedData ? (
                  <CategorizedDataTable extractedFields={ocrResult.extractedFields} documentType={documentType} />
                ) : (
                  <ExtractedFieldsDisplay extractedFields={ocrResult.extractedFields} />
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

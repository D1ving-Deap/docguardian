
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, X, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { supabase, supabaseUrl } from "@/integrations/supabase/client";
import storage from '@/utils/supabaseStorage';
import { performOCR, extractFieldsFromText } from '@/utils/ocrService';

interface DocumentUploadProps {
  label: string;
  description?: string;
  acceptTypes?: string;
  documentType: string;
  applicationId: string;
  onChange?: (documentId: string | null, extractedData?: any) => void;
}

const DocumentUpload = ({ 
  label, 
  description, 
  acceptTypes = "application/pdf,image/jpeg,image/png,image/tiff", 
  documentType,
  applicationId,
  onChange 
}: DocumentUploadProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB",
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
  
  const extractTextWithTesseract = async (imageUrl: string): Promise<{ text: string, extractedFields?: any }> => {
    setProcessingStatus('Initializing OCR engine...');
    
    try {
      // Convert URL to File object for processing
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'document.png', { type: blob.type });
      
      setProcessingStatus('Reading document text...');
      
      // Use the WASM-based OCR engine
      const result = await performOCR(file, (progress) => {
        setProcessingStatus(`Processing document: ${Math.round(progress * 100)}%`);
      });
      
      setProcessingStatus('Extracting data from text...');
      
      const extractedFields = extractFieldsFromText(result.text, documentType);
      
      return { 
        text: result.text,
        extractedFields
      };
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to extract text from document');
    }
  };
  
  const extractFieldsFromText = (text: string, docType: string): any => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const extractedFields: Record<string, string | { processed: string; confidence: number; edited: boolean }> = {};
    
    if (docType.toLowerCase().includes('income') || docType.toLowerCase().includes('pay')) {
      const incomeRegex = /\$?(\d{1,3}(,\d{3})*(\.\d{2})?)/g;
      const incomeMatches = text.match(incomeRegex);
      
      if (incomeMatches && incomeMatches.length > 0) {
        extractedFields.income = incomeMatches[0];
      }
      
      const dateRegex = /\b(0?[1-9]|1[0-2])[\/](0?[1-9]|[12]\d|3[01])[\/](19|20)\d{2}\b/g;
      const dateMatches = text.match(dateRegex);
      
      if (dateMatches && dateMatches.length > 0) {
        extractedFields.statementDate = dateMatches[0];
      }
    } 
    else if (docType.toLowerCase().includes('id') || docType.toLowerCase().includes('license')) {
      for (const line of lines) {
        if (line.toLowerCase().includes('name:')) {
          extractedFields.name = line.split(':')[1]?.trim() || '';
          break;
        }
      }
      
      const dobRegex = /\b(0?[1-9]|1[0-2])[\/](0?[1-9]|[12]\d|3[01])[\/](19|20)\d{2}\b/g;
      const dobMatches = text.match(dobRegex);
      
      if (dobMatches && dobMatches.length > 0) {
        extractedFields.dateOfBirth = dobMatches[0];
      }
      
      const idRegex = /\b[A-Z0-9]{6,15}\b/g;
      const idMatches = text.match(idRegex);
      
      if (idMatches && idMatches.length > 0) {
        extractedFields.idNumber = idMatches[0];
      }
    }
    
    extractedFields.metadata = JSON.stringify({
      processed: new Date().toISOString(),
      confidence: Math.random() * 100,
      edited: Math.random() < 0.2
    });
    
    return extractedFields;
  };
  
  const handleUpload = async () => {
    if (!file || !applicationId) return;
    
    setIsUploading(true);
    setProcessingStatus('Uploading document...');
    
    try {
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
      
      setProcessingStatus('Processing document with browser-based OCR...');
      
      let ocrResult: { text: string, extractedFields?: any } = { text: '' };
      
      const objectUrl = URL.createObjectURL(file);
      
      try {
        ocrResult = await extractTextWithTesseract(objectUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
      
      setProcessingStatus('Saving document information...');
      
      const documentId = crypto.randomUUID();
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          id: documentId,
          application_id: applicationId,
          document_type: documentType,
          filename: file.name,
          file_path: uploadResult.key,
          raw_text: ocrResult.text || '',
          structured_data: ocrResult.extractedFields || {}
        })
        .select();
      
      if (docError) {
        console.error('Error storing document metadata:', docError);
        throw new Error(`Database error: ${docError.message}`);
      }
      
      setProcessingStatus('Running fraud checks...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          applicationId,
          documentType,
          extractedText: ocrResult.text,
          extractedFields: ocrResult.extractedFields
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error processing document');
      }
      
      const result = await response.json();
      
      toast({
        title: "Document Processed",
        description: "File uploaded and processed successfully with browser-based OCR"
      });
      
      setUploadedDocId(documentId);
      setExtractedData(ocrResult.extractedFields);
      
      if (onChange) {
        onChange(documentId, ocrResult.extractedFields);
      }
    } catch (error: any) {
      console.error('Document processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setProcessingStatus('');
    }
  };
  
  const handleRemove = async () => {
    setFile(null);
    setUploadedDocId(null);
    setExtractedData(null);
    
    if (onChange) {
      onChange(null);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{label}</div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      {!file ? (
        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
          <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            Upload PDF or image for automatic text extraction via browser-based OCR
          </p>
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}>
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>Choose File</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {!uploadedDocId ? (
            <div className="space-y-3">
              {processingStatus && (
                <div className="text-xs text-muted-foreground">{processingStatus}</div>
              )}
              
              <Button 
                onClick={handleUpload} 
                disabled={isUploading} 
                className="w-full"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing with browser OCR...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process with browser OCR
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Document processed successfully
              </div>
              
              {extractedData && Object.keys(extractedData).length > 0 && (
                <div className="mt-3 border rounded p-3 bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">Extracted Information</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(extractedData).map(([key, value]) => {
                      if (key === "metadata" && typeof value === "object") return null;
                      
                      return (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <span className="col-span-2">{value as string}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;

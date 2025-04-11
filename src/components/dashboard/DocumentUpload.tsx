import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, X, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { supabase, supabaseUrl } from "@/integrations/supabase/client";
import storage from '@/utils/supabaseStorage';

// DocumentUpload Component Props
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
  acceptTypes = "application/pdf", 
  documentType,
  applicationId,
  onChange 
}: DocumentUploadProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file type
      if (!selectedFile.type.includes('pdf')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !applicationId) return;
    
    setIsUploading(true);
    
    try {
      // First, upload the file to Supabase Storage
      // Generate a more sanitized key
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${applicationId}/${documentType}`;
      const uploadResult = await storage.uploadFile(
        file,
        'applications',
        filePath + '/' + safeName
      );
      
      if ('error' in uploadResult) {
        throw new Error(uploadResult.error);
      }
      
      // Now, create a FormData for the edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('documentType', documentType);
      formData.append('filePath', uploadResult.key);
      
      console.log(`Uploaded to ${uploadResult.key}, calling edge function...`);
      
      // Call our edge function to process the document
      const response = await fetch(`${supabaseUrl}/functions/v1/process-document`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error processing document');
      }
      
      const result = await response.json();
      
      toast({
        title: "Document Processed",
        description: "File uploaded and processed successfully"
      });
      
      setUploadedDocId(result.documentId);
      setExtractedData(result.extractedFields);
      
      if (onChange) {
        onChange(result.documentId, result.extractedFields);
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
            Upload PDF document for automatic text extraction
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
              <span>Choose PDF File</span>
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
            <Button 
              onClick={handleUpload} 
              disabled={isUploading} 
              className="w-full"
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Process Document
                </>
              )}
            </Button>
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
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2">
                        <span className="text-gray-500 font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <span className="col-span-2">{value as string}</span>
                      </div>
                    ))}
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

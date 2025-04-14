
import React from 'react';
import { FileUp, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploaderProps {
  file: File | null;
  isProcessing: boolean;
  onFileChange: (file: File | null) => void;
  onProcess: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  file,
  isProcessing,
  onFileChange,
  onProcess
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        // File size check should be handled by parent component
        return;
      }
      
      if (!selectedFile.type.includes('pdf') && 
          !selectedFile.type.includes('image/')) {
        // File type check should be handled by parent component
        return;
      }
      
      onFileChange(selectedFile);
    }
  };
  
  if (!file) {
    return (
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
    );
  }
  
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2 text-blue-500" />
        <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
      </div>
      {!isProcessing && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onFileChange(null)}
          className="text-gray-500"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default DocumentUploader;

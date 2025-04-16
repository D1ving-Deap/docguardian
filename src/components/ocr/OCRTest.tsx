
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { performOCR } from '@/utils/tesseractOCR';
import { Progress } from "@/components/ui/progress";
import { Loader2, FileUp, FileText, CheckCircle2, X } from "lucide-react";

const OCRTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const processImage = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setErrorMessage(null);

    try {
      const ocrResult = await performOCR(file, (progress) => {
        setProgress(progress * 100);
      });
      
      setResult(ocrResult.text);
    } catch (error) {
      console.error('OCR processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
    setProgress(0);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">OCR Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
            <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              Upload an image to test OCR functionality
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="ocr-test-file"
            />
            <label htmlFor="ocr-test-file">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Select Image</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={reset}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isProcessing ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processing...</span>
                  <span className="text-sm">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Processing complete</span>
                </div>
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Extracted Text:</h3>
                  <div className="whitespace-pre-wrap text-sm">{result || "No text detected"}</div>
                </div>
                <Button onClick={reset} variant="outline">Process Another Image</Button>
              </div>
            ) : errorMessage ? (
              <div className="space-y-4">
                <div className="text-red-500 p-3 bg-red-50 rounded-md">
                  <h3 className="font-medium mb-1">Error:</h3>
                  <p className="text-sm">{errorMessage}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={processImage} className="flex-1">Try Again</Button>
                  <Button onClick={reset} variant="outline" className="flex-1">Reset</Button>
                </div>
              </div>
            ) : (
              <Button onClick={processImage} className="w-full">
                Process Image
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OCRTest;


import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { performOCR } from '@/utils/tesseractOCR';
import { Progress } from "@/components/ui/progress";
import { Loader2, FileUp, FileText, CheckCircle2, X, AlertTriangle, RefreshCw } from "lucide-react";
import { TESSERACT_CONFIG } from '@/utils/tesseractConfig';
import { verifyOCRAssets, fixOCRAssetIssues } from '@/utils/ocrAssetVerifier';
import { toast } from "@/hooks/use-toast";

const OCRTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);

  useEffect(() => {
    const checkAssets = async () => {
      try {
        setIsVerifying(true);
        console.log('Checking OCR assets availability...');
        const result = await verifyOCRAssets();
        setVerificationResult(result);
        
        // If issues are found, show toast notification
        if (!result.success) {
          toast({
            title: "OCR asset issues detected",
            description: "Some OCR files may be missing or invalid. Try running auto-fix.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error verifying OCR assets:', error);
        setVerificationResult({
          success: false,
          details: {
            suggestions: [`Error checking assets: ${error instanceof Error ? error.message : 'Unknown error'}`],
            browserInfo: { userAgent: navigator.userAgent }
          }
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    checkAssets();
  }, []);

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
      // Use custom path from session storage if available
      const customWasmPath = sessionStorage.getItem('ocr-wasm-path');
      
      const ocrResult = await performOCR(file, (progress) => {
        setProgress(progress * 100);
      }, customWasmPath ? { corePath: customWasmPath } : undefined);
      
      setResult(ocrResult.text);
    } catch (error) {
      console.error('OCR processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Show toast with error
      toast({
        title: "OCR Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
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

  const runVerification = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyOCRAssets();
      setVerificationResult(result);
      
      if (result.success) {
        toast({
          title: "Verification Complete",
          description: "All OCR assets verified successfully",
          variant: "default"
        });
      } else {
        toast({
          title: "Verification Issues",
          description: `Issues found: ${result.details.suggestions[0]}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const runAutoFix = async () => {
    setIsFixing(true);
    try {
      const result = await fixOCRAssetIssues();
      setFixResult(result);
      
      toast({
        title: result.success ? "Auto-Fix Successful" : "Auto-Fix Issues",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      // Re-run verification after fixing
      await runVerification();
    } catch (error) {
      console.error('Fix error:', error);
      toast({
        title: "Fix Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">OCR Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationResult && (
          <div className={`border p-3 rounded-md mb-4 ${verificationResult.success ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center">
              {verificationResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              )}
              <span className="font-medium">{verificationResult.success ? 'OCR Assets Ready' : 'OCR Asset Warning'}</span>
            </div>
            
            {!verificationResult.success && verificationResult.details.suggestions.length > 0 && (
              <div className="mt-2 text-sm">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {verificationResult.details.suggestions.slice(0, 2).map((suggestion: string, i: number) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-3 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={runVerification}
                disabled={isVerifying}
                className="flex-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify Files'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={runAutoFix}
                disabled={isFixing || isVerifying}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isFixing ? 'animate-spin' : ''}`} />
                {isFixing ? 'Fixing...' : 'Auto-Fix Issues'}
              </Button>
            </div>
            
            <div className="mt-3 text-xs border-t pt-2 text-gray-500">
              <p>Current Paths:</p>
              <div>Worker: {TESSERACT_CONFIG.workerPath}</div>
              <div>WASM: {TESSERACT_CONFIG.corePath}</div>
              <div>Training: {TESSERACT_CONFIG.trainingDataPath}</div>
              {sessionStorage.getItem('ocr-wasm-path') && (
                <div className="mt-1 text-green-600">
                  Using custom WASM path: {sessionStorage.getItem('ocr-wasm-path')}
                </div>
              )}
            </div>
          </div>
        )}
        
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
              <Button 
                variant="outline" 
                className="cursor-pointer" 
                asChild
                disabled={isVerifying || (!verificationResult?.success && !sessionStorage.getItem('ocr-wasm-path'))}
              >
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
                  <Button onClick={runAutoFix} variant="outline" className="flex-1">
                    <RefreshCw className={`h-4 w-4 mr-1 ${isFixing ? 'animate-spin' : ''}`} />
                    Fix Issues
                  </Button>
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

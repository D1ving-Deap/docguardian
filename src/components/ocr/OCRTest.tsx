import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { performOCR } from '@/utils/tesseractOCR';
import { Progress } from "@/components/ui/progress";
import { Loader2, FileUp, FileText, CheckCircle2, X, AlertTriangle, RefreshCw, Download } from "lucide-react";
import { TESSERACT_CONFIG } from '@/utils/tesseractConfig';
import { verifyOCRAssets, fixOCRAssetIssues } from '@/utils/ocrAssetVerifier';
import { downloadWasmFile, downloadTrainingData, createWasmBlobUrl } from '@/utils/directWasmDownloader';
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
  const [directDownloadAttempted, setDirectDownloadAttempted] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const getCachedWasmBlob = () => {
    return createWasmBlobUrl();
  };

  useEffect(() => {
    const checkAssets = async () => {
      try {
        setIsVerifying(true);
        console.log('Checking OCR assets availability...');
        
        const cachedWasmBlob = getCachedWasmBlob();
        if (cachedWasmBlob) {
          console.log('Using cached WASM blob URL:', cachedWasmBlob);
          sessionStorage.setItem('ocr-wasm-path', cachedWasmBlob);
          
          toast({
            title: "Using cached WASM file",
            description: "Using previously downloaded WASM file from session cache",
            variant: "default"
          });
          
          setVerificationResult({
            success: true,
            details: {
              suggestions: ["Using cached WASM file from browser session"],
              browserInfo: { userAgent: navigator.userAgent }
            }
          });
          setIsVerifying(false);
          return;
        }
        
        const result = await verifyOCRAssets();
        console.log('Verification result:', result);
        
        setVerificationResult({
          success: result.success,
          missingFiles: result.missingFiles,
          browserInfo: result.browserInfo,
          message: result.message,
          details: {
            suggestions: result.details.suggestions,
            browserInfo: result.details.browserInfo
          }
        });
        
        if (!result.success) {
          toast({
            title: "OCR asset issues detected",
            description: result.message || "Some OCR files may be missing or invalid. Try running auto-fix.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error verifying OCR assets:', error);
        setVerificationResult({
          success: false,
          missingFiles: ['Verification error'],
          message: `Error checking assets: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    setLastAction('process');

    try {
      let wasmOptions: any = {};
      const cachedWasmBlob = getCachedWasmBlob();
      
      if (cachedWasmBlob) {
        console.log('Using cached WASM blob URL for OCR:', cachedWasmBlob);
        wasmOptions.corePath = cachedWasmBlob;
      } else {
        const customWasmPath = sessionStorage.getItem('ocr-wasm-path');
        if (customWasmPath) {
          console.log('Using custom WASM path from session storage:', customWasmPath);
          wasmOptions.corePath = customWasmPath;
        }
      }
      
      const cachedTrainingPath = sessionStorage.getItem('ocr-training-data-path');
      if (cachedTrainingPath) {
        console.log('Using cached training data path:', cachedTrainingPath);
        wasmOptions.trainingDataPath = cachedTrainingPath;
      } else {
        console.log('Forcing use of local training data path');
        wasmOptions.trainingDataPath = '/tessdata/eng.traineddata';
      }
      
      console.log('Starting OCR with options:', wasmOptions);
      
      const ocrResult = await performOCR(
        file, 
        (progress) => {
          setProgress(progress * 100);
        }, 
        wasmOptions
      );
      
      setResult(ocrResult.text);
      
      toast({
        title: "OCR Processing Complete",
        description: "Text successfully extracted from image",
        variant: "default"
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      
      if (error instanceof Error && (error.message.includes('WebAssembly') || error.message.includes('model failed to load'))) {
        await tryDirectDownload();
      } else {
        toast({
          title: "OCR Processing Failed",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const tryDirectDownload = async () => {
    setDirectDownloadAttempted(true);
    setIsFixing(true);
    setLastAction('download');
    
    toast({
      title: "Attempting Direct Download",
      description: "Downloading OCR files directly...",
      variant: "default"
    });
    
    try {
      console.log('Starting direct WASM download');
      const wasmSuccess = await downloadWasmFile('tesseract-core.wasm');
      console.log('Direct WASM download result:', wasmSuccess);
      
      console.log('Starting training data download');
      const trainingSuccess = await downloadTrainingData();
      console.log('Training data download result:', trainingSuccess);
      
      const blobUrl = getCachedWasmBlob();
      console.log('Got blob URL after download:', blobUrl);
      
      if (blobUrl && (wasmSuccess || trainingSuccess)) {
        if (!sessionStorage.getItem('ocr-training-data-path')) {
          console.log('Setting default training data path');
          sessionStorage.setItem('ocr-training-data-path', '/tessdata/eng.traineddata');
        }
        
        toast({
          title: "Direct Download Successful",
          description: "OCR files downloaded. Try processing your image now.",
          variant: "default"
        });
        
        setVerificationResult({
          success: true,
          missingFiles: [],
          message: "Downloaded OCR files successfully",
          details: {
            suggestions: ["Using directly downloaded OCR files"],
            browserInfo: { userAgent: navigator.userAgent }
          }
        });
        
        if (file) {
          setTimeout(() => processImage(), 500);
        }
        
        return true;
      }
      
      toast({
        title: "Direct Download Failed",
        description: "Could not download all OCR files. Try a different browser (Chrome recommended).",
        variant: "destructive"
      });
      
      return false;
    } catch (error) {
      console.error('Direct download error:', error);
      
      toast({
        title: "Direct Download Error",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsFixing(false);
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
    setLastAction('verify');
    try {
      const hadCachedPath = !!sessionStorage.getItem('ocr-wasm-path');
      if (hadCachedPath) {
        console.log('Removing cached WASM path for fresh verification');
      }
      
      console.log('Running verification...');
      const result = await verifyOCRAssets();
      console.log('Fresh verification result:', result);
      
      setVerificationResult({
        success: result.success,
        missingFiles: result.missingFiles,
        message: result.message,
        browserInfo: result.browserInfo,
        details: {
          suggestions: result.details.suggestions,
          browserInfo: result.details.browserInfo
        }
      });
      
      if (result.success) {
        toast({
          title: "Verification Complete",
          description: "All OCR assets verified successfully",
          variant: "default"
        });
      } else {
        toast({
          title: "Verification Issues",
          description: result.message || "Issues found with OCR files",
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
      
      setVerificationResult({
        success: false,
        missingFiles: ['Verification error'],
        message: `Error during verification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          suggestions: [`Error during verification: ${error instanceof Error ? error.message : 'Unknown error'}`],
          browserInfo: { userAgent: navigator.userAgent }
        }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const runAutoFix = async () => {
    setIsFixing(true);
    setLastAction('fix');
    
    try {
      toast({
        title: "Running Auto-Fix",
        description: "Attempting to fix OCR issues...",
        variant: "default"
      });
      
      console.log('Starting direct download as part of auto-fix');
      const directSuccess = await tryDirectDownload();
      
      if (directSuccess) {
        setFixResult({
          success: true,
          message: "Successfully downloaded OCR files directly",
          fixesApplied: ["Direct download of OCR files"]
        });
        
        await runVerification();
        
        toast({
          title: "Auto-Fix Successful",
          description: "Downloaded OCR files directly. Try processing an image now.",
          variant: "default"
        });
      } else {
        toast({
          title: "Auto-Fix Issues",
          description: "Could not fix issues automatically. Try using a different browser.",
          variant: "destructive"
        });
        
        setFixResult({
          success: false,
          message: "Could not download OCR files from any source",
          fixesApplied: []
        });
      }
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

  const getActionContent = () => {
    if (lastAction === 'verify' && !verificationResult?.success) {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md my-3">
          <h3 className="font-medium">Verification Issues</h3>
          <p className="text-sm mt-1">
            OCR files could not be verified. Please try:
          </p>
          <ul className="list-disc list-inside text-sm pl-2 mt-1 space-y-1">
            <li>Using the "Direct Download" button to get files directly</li>
            <li>Using Chrome browser (recommended)</li>
            <li>Clearing your browser cache and trying again</li>
          </ul>
        </div>
      );
    }
    
    if (lastAction === 'fix' && !fixResult?.success) {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md my-3">
          <h3 className="font-medium">Auto-Fix Issues</h3>
          <p className="text-sm mt-1">
            Could not automatically fix OCR issues. Please try:
          </p>
          <ul className="list-disc list-inside text-sm pl-2 mt-1 space-y-1">
            <li>Using a different browser (Chrome recommended)</li>
            <li>Checking your internet connection</li>
            <li>Trying the "Direct Download" button again</li>
          </ul>
        </div>
      );
    }
    
    if (lastAction === 'download' && !verificationResult?.success) {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md my-3">
          <h3 className="font-medium">Download Issues</h3>
          <p className="text-sm mt-1">
            Could not download WASM files. Please try:
          </p>
          <ul className="list-disc list-inside text-sm pl-2 mt-1 space-y-1">
            <li>Using Chrome browser (most reliable for WASM)</li>
            <li>Checking your internet connection</li>
            <li>Trying again in a few minutes</li>
          </ul>
        </div>
      );
    }
    
    return null;
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
            
            {!verificationResult.success && verificationResult.details?.suggestions?.length > 0 && (
              <div className="mt-2 text-sm">
                <p className="font-medium">Issues Detected:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {verificationResult.details.suggestions.slice(0, 3).map((suggestion: string, i: number) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {getActionContent()}
            
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
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={tryDirectDownload}
                disabled={isFixing || isVerifying}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Direct Download
              </Button>
            </div>
            
            <div className="mt-3 text-xs border-t pt-2 text-gray-500">
              <p>Current Configuration:</p>
              {sessionStorage.getItem('ocr-wasm-path') ? (
                <div className="mt-1 text-green-600">
                  Using custom WASM path: {sessionStorage.getItem('ocr-wasm-path')}
                </div>
              ) : getCachedWasmBlob() ? (
                <div className="mt-1 text-green-600">
                  Using WASM from browser cache (downloaded from {sessionStorage.getItem('ocr-wasm-source') || 'unknown source'})
                </div>
              ) : (
                <>
                  <div>Worker: {TESSERACT_CONFIG.workerPath}</div>
                  <div>WASM: {TESSERACT_CONFIG.corePath}</div>
                  <div>Training: {TESSERACT_CONFIG.trainingDataPath}</div>
                </>
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
                  <Button onClick={tryDirectDownload} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Direct Download
                  </Button>
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

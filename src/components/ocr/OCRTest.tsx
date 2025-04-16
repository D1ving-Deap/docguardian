import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { performOCR } from '@/utils/tesseractOCR';
import { Progress } from "@/components/ui/progress";
import { Loader2, FileUp, FileText, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { verifyOCRFiles, TESSERACT_CONFIG } from '@/utils/tesseractConfig';

const OCRTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{ 
    success: boolean; 
    message: string; 
    missingFiles: string[] 
  } | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [isValidatingFiles, setIsValidatingFiles] = useState(false);

  useEffect(() => {
    const checkAssets = async () => {
      try {
        setIsValidatingFiles(true);
        console.log('Checking OCR assets availability...');
        const status = await verifyOCRFiles();
        setVerificationStatus(status);
        
        if (status.success) {
          try {
            const isValid = await validateWasmFile(TESSERACT_CONFIG.corePath);
            if (!isValid) {
              setVerificationStatus({
                success: false,
                message: 'WASM file has invalid format. Please run the copy-tesseract-files.js script.',
                missingFiles: ['Core WASM (Invalid format)']
              });
            }
          } catch (wasmError) {
            console.error('Error validating WASM file:', wasmError);
          }
        }
        
        const browserInfo = {
          userAgent: navigator.userAgent,
          wasmSupported: typeof WebAssembly === 'object',
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          browser: navigator.userAgent.indexOf('Chrome') > -1 ? 'Chrome' : 
                  navigator.userAgent.indexOf('Firefox') > -1 ? 'Firefox' :
                  navigator.userAgent.indexOf('Safari') > -1 ? 'Safari' :
                  navigator.userAgent.indexOf('Edge') > -1 ? 'Edge' : 'Unknown',
          url: window.location.href,
          protocol: window.location.protocol
        };
        
        setDiagnosticInfo(browserInfo);
      } catch (error) {
        console.error('Error verifying OCR assets:', error);
        setVerificationStatus({
          success: false,
          message: `Error checking assets: ${error instanceof Error ? error.message : 'Unknown error'}`,
          missingFiles: []
        });
      } finally {
        setIsValidatingFiles(false);
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

  const runFileValidation = async () => {
    setIsValidatingFiles(true);
    try {
      const wasmValid = await validateWasmFile(TESSERACT_CONFIG.corePath);
      const workerExists = await checkFileExists(TESSERACT_CONFIG.workerPath);
      const trainingExists = await checkFileExists(TESSERACT_CONFIG.trainingDataPath);
      
      const fallbackWasmValid = await validateWasmFile(TESSERACT_CONFIG.fallbackPaths.corePath);
      const fallbackWorkerExists = await checkFileExists(TESSERACT_CONFIG.fallbackPaths.workerPath);
      const fallbackTrainingExists = await checkFileExists(TESSERACT_CONFIG.fallbackPaths.trainingDataPath);
      
      const validationResults = {
        primary: {
          wasm: { exists: wasmValid, path: TESSERACT_CONFIG.corePath },
          worker: { exists: workerExists, path: TESSERACT_CONFIG.workerPath },
          training: { exists: trainingExists, path: TESSERACT_CONFIG.trainingDataPath }
        },
        fallback: {
          wasm: { exists: fallbackWasmValid, path: TESSERACT_CONFIG.fallbackPaths.corePath },
          worker: { exists: fallbackWorkerExists, path: TESSERACT_CONFIG.fallbackPaths.workerPath },
          training: { exists: fallbackTrainingExists, path: TESSERACT_CONFIG.fallbackPaths.trainingDataPath }
        }
      };
      
      setDiagnosticInfo({
        ...diagnosticInfo,
        validation: validationResults,
        timestamp: new Date().toISOString()
      });
      
      const newStatus = {
        success: wasmValid && workerExists && trainingExists,
        message: wasmValid && workerExists && trainingExists ? 
          'All OCR files verified successfully' : 
          'Some OCR files are missing or invalid',
        missingFiles: []
      };
      
      if (!wasmValid) newStatus.missingFiles.push('Core WASM');
      if (!workerExists) newStatus.missingFiles.push('Worker JS');
      if (!trainingExists) newStatus.missingFiles.push('Training Data');
      
      setVerificationStatus(newStatus);
    } catch (error) {
      console.error('Validation error:', error);
      setDiagnosticInfo({
        ...diagnosticInfo,
        validationError: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsValidatingFiles(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">OCR Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationStatus && (
          <div className={`border p-3 rounded-md mb-4 ${verificationStatus.success ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center">
              {verificationStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              )}
              <span className="font-medium">{verificationStatus.success ? 'OCR Assets Ready' : 'OCR Asset Warning'}</span>
            </div>
            <p className="text-sm mt-1">{verificationStatus.message}</p>
            
            <div className="mt-2 text-xs text-gray-500">
              <div>Worker Path: {TESSERACT_CONFIG.workerPath}</div>
              <div>WASM Path: {TESSERACT_CONFIG.corePath}</div>
              <div>Training Data: {TESSERACT_CONFIG.trainingDataPath}</div>
            </div>
            
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={runFileValidation}
                disabled={isValidatingFiles}
              >
                {isValidatingFiles ? 'Validating...' : 'Validate Files'}
              </Button>
            </div>
          </div>
        )}
        
        {diagnosticInfo && (
          <div className="border p-3 rounded-md mb-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-medium">Diagnostic Information</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDiagnosticInfo(null)} 
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
              <pre>{JSON.stringify(diagnosticInfo, null, 2)}</pre>
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

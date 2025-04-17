
import React, { useState } from 'react';
import OCRTest from '@/components/ocr/OCRTest';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info, FileText, Download, CheckCircle2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { downloadWasmFile, downloadTrainingData } from '@/utils/directWasmDownloader';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const OCRTestPage: React.FC = () => {
  const { toast } = useToast();
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleManualDownload = async () => {
    try {
      setDownloading(true);
      setDiagnosticInfo("Starting download of OCR assets...");
      
      // First, clear any existing cached data to force a fresh download
      sessionStorage.removeItem('ocr-wasm-path');
      sessionStorage.removeItem('ocr-wasm-binary');
      sessionStorage.removeItem('ocr-training-data-path');
      
      setDiagnosticInfo("Downloading WASM file...");
      const wasmSuccess = await downloadWasmFile('tesseract-core.wasm');
      
      if (wasmSuccess) {
        setDiagnosticInfo("WASM file downloaded successfully. Downloading training data...");
        const trainingSuccess = await downloadTrainingData();
        
        if (trainingSuccess) {
          setDiagnosticInfo("All OCR assets downloaded successfully. You can now process images.");
          setDownloadSuccess(true);
          toast({
            title: "OCR Assets Downloaded",
            description: "All required files have been downloaded. Please try processing an image now.",
          });
        } else {
          setDiagnosticInfo("WASM file downloaded but training data could not be verified. The system will use local fallbacks.");
          toast({
            title: "Partial Download Success",
            description: "Core files downloaded but training data may be missing. The system will attempt to use fallbacks.",
            variant: "destructive"  // Changed from "warning" to "destructive" to match allowed variants
          });
        }
      } else {
        setDiagnosticInfo("Failed to download WASM file. Please try a different browser or check your internet connection.");
        toast({
          title: "Download Failed",
          description: "Could not download required OCR files. Please try a different browser.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Manual download error:', error);
      setDiagnosticInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Download Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const runDiagnostics = () => {
    try {
      // Check WebAssembly support
      const wasmSupported = typeof WebAssembly === 'object';
      
      // Check cached files
      const cachedWasmPath = sessionStorage.getItem('ocr-wasm-path');
      const cachedTrainingPath = sessionStorage.getItem('ocr-training-data-path');
      const cachedWasmBinary = sessionStorage.getItem('ocr-wasm-binary') ? 'Present' : 'Missing';
      
      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        isChrome: navigator.userAgent.indexOf('Chrome') > -1,
        isFirefox: navigator.userAgent.indexOf('Firefox') > -1,
        isEdge: navigator.userAgent.indexOf('Edg') > -1,
        isSafari: navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      };
      
      const diagnosticText = `
OCR System Diagnostics:
-----------------------
WebAssembly Support: ${wasmSupported ? 'Yes' : 'No'}
Browser: ${browserInfo.isChrome ? 'Chrome' : 
          browserInfo.isFirefox ? 'Firefox' : 
          browserInfo.isEdge ? 'Edge' : 
          browserInfo.isSafari ? 'Safari' : 'Other'}
Mobile Device: ${browserInfo.isMobile ? 'Yes' : 'No'}
Cached WASM Path: ${cachedWasmPath || 'Not cached'}
Cached Training Data Path: ${cachedTrainingPath || 'Not cached'}
Cached WASM Binary: ${cachedWasmBinary}
Session Storage Available: ${typeof sessionStorage !== 'undefined'}
User Agent: ${browserInfo.userAgent}
      `;
      
      setDiagnosticInfo(diagnosticText);
      
      toast({
        title: "Diagnostics Complete",
        description: "OCR system diagnostics gathered. See results below.",
      });
      
    } catch (error) {
      console.error('Diagnostics error:', error);
      setDiagnosticInfo(`Error running diagnostics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4 text-center">OCR Test Page</h1>
      
      <Card className="mb-6 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-700">About OCR Testing</h3>
              <p className="text-sm text-blue-600 mt-1">
                This page allows you to test the OCR functionality using WebAssembly technology. 
                If you encounter errors, use the "Run Diagnostics" button to check your system compatibility.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                For best results:
              </p>
              <ul className="text-sm text-blue-600 list-disc pl-5 mt-1">
                <li>Use a modern browser (Chrome recommended)</li>
                <li>Upload clear images with readable text</li>
                <li>Try JPG or PNG formats for best compatibility</li>
                <li>If errors persist, try the manual download button below</li>
              </ul>
              
              <div className="mt-3 space-x-2">
                <Button 
                  onClick={handleManualDownload} 
                  variant="outline" 
                  size="sm" 
                  className="bg-white"
                  disabled={downloading}
                >
                  {downloading ? (
                    <>Downloading...</>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Downloaded Successfully
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Manual Download OCR Assets
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={runDiagnostics} 
                  variant="outline" 
                  size="sm" 
                  className="bg-white"
                >
                  Run Diagnostics
                </Button>
              </div>
              
              {diagnosticInfo && (
                <div className="mt-3 p-3 bg-white rounded-md border border-blue-200">
                  <h4 className="text-sm font-medium mb-1">Diagnostic Information</h4>
                  <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded">
                    {diagnosticInfo}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-700">Troubleshooting WebAssembly Issues</h3>
              <p className="text-sm text-amber-600 mt-1">
                If you see "WebAssembly file is corrupted or missing" errors:
              </p>
              <ol className="text-sm text-amber-600 list-decimal pl-5 mt-1">
                <li>Click the "Manual Download OCR Assets" button above to fetch WASM files directly</li>
                <li>Try using a different browser (Chrome works best for WebAssembly)</li>
                <li>Clear your browser cache and reload the page</li>
                <li>Make sure you're using a secure connection (HTTPS)</li>
                <li>Run the diagnostics to identify specific issues</li>
              </ol>
              
              <div className="p-3 bg-white rounded mt-3 border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Common Error Messages
                </h4>
                <ul className="text-xs text-amber-700 mt-1 space-y-1">
                  <li><strong>Expected magic word 00 61 73 6d:</strong> The WASM file is corrupted or not downloading properly. Try the Manual Download button.</li>
                  <li><strong>Invalid WebAssembly file:</strong> The browser cannot load the WASM file. Try a different browser or use Manual Download.</li>
                  <li><strong>Failed to fetch:</strong> Network error while loading assets. Check your internet connection.</li>
                  <li><strong>Text recognition model failed to load:</strong> The training data file (eng.traineddata) could not be loaded. Use the Manual Download button.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <OCRTest />
    </div>
  );
};

export default OCRTestPage;

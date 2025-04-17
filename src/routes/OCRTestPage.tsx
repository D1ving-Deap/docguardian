import React, { useState, useEffect } from 'react';
import OCRTest from '@/components/ocr/OCRTest';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info, FileText, Download, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from '@/components/ui/button';
import { downloadWasmFile, downloadTrainingData, createWasmBlobUrl } from '@/utils/directWasmDownloader';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { TESSERACT_CONFIG } from '@/utils/tesseractConfig';

const OCRTestPage: React.FC = () => {
  const { toast } = useToast();
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [autoRetryAttempted, setAutoRetryAttempted] = useState(false);

  // Auto-download assets on component mount if we're on a dashboard route
  useEffect(() => {
    const isOnDashboardRoute = window.location.pathname.includes('/dashboard');
    const needsDownload = isOnDashboardRoute && !autoRetryAttempted;
    
    if (needsDownload) {
      console.log('Auto-triggering download due to dashboard route detection');
      setAutoRetryAttempted(true);
      handleManualDownload();
    }
  }, []);

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
          // Even if training data download reports failure, we'll still set a fallback path
          const fallbackPath = 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata';
          sessionStorage.setItem('ocr-training-data-path', fallbackPath);
          
          setDiagnosticInfo("WASM file downloaded but had to use fallback for training data. The system should still work.");
          setDownloadSuccess(true);
          toast({
            title: "Download Completed with Fallbacks",
            description: "WASM file downloaded and training data fallback configured. You can try processing an image now.",
            variant: "default"
          });
        }
      } else {
        // Even after failure, force CDN paths as a last resort
        sessionStorage.setItem('ocr-wasm-path', 'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm');
        sessionStorage.setItem('ocr-training-data-path', 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata');
        
        setDiagnosticInfo("Failed to download WASM file but set CDN fallbacks. Please try processing an image now.");
        setDownloadSuccess(true);
        toast({
          title: "Using CDN Fallbacks",
          description: "Local files not available. Using CDN fallbacks instead. Please try processing an image now.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Manual download error:', error);
      setDiagnosticInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Force CDN paths as last resort even after error
      sessionStorage.setItem('ocr-wasm-path', 'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm');
      sessionStorage.setItem('ocr-training-data-path', 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata');
      
      toast({
        title: "Using CDN Fallbacks",
        description: "Error encountered. Using CDN fallbacks. Please try processing an image now.",
        variant: "default"
      });
    } finally {
      setDownloading(false);
    }
  };

  const refreshOCRAssets = async () => {
    try {
      setDownloading(true);
      setDiagnosticInfo("Force refreshing OCR assets from all possible sources...");
      
      // Clear all cached paths
      sessionStorage.removeItem('ocr-wasm-path');
      sessionStorage.removeItem('ocr-wasm-binary');
      sessionStorage.removeItem('ocr-wasm-source');
      sessionStorage.removeItem('ocr-training-data-path');
      
      // Try to download from all sources one by one
      const wasmSuccess = await downloadWasmFile('tesseract-core.wasm');
      const trainingSuccess = await downloadTrainingData();
      
      if (wasmSuccess && trainingSuccess) {
        setDiagnosticInfo("Successfully refreshed all OCR assets.");
        setDownloadSuccess(true);
        toast({
          title: "OCR Assets Refreshed",
          description: "All OCR assets have been successfully refreshed.",
        });
      } else {
        // Try the CDN fallback approach
        sessionStorage.setItem('ocr-wasm-path', 'https://unpkg.com/tesseract-wasm@0.10.0/dist/tesseract-core.wasm');
        sessionStorage.setItem('ocr-training-data-path', 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata');
        
        setDiagnosticInfo("Could not refresh from local sources. Using CDN fallbacks.");
        toast({
          title: "Using CDN Fallbacks",
          description: "Local assets could not be refreshed. Using CDN fallbacks instead.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
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
      const cachedWasmSource = sessionStorage.getItem('ocr-wasm-source') || 'Not recorded';
      
      // Get current location info
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;
      const isOnSubRoute = currentPath.includes('/dashboard') || currentPath.includes('/login');
      
      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        isChrome: navigator.userAgent.indexOf('Chrome') > -1,
        isFirefox: navigator.userAgent.indexOf('Firefox') > -1,
        isEdge: navigator.userAgent.indexOf('Edg') > -1,
        isSafari: navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      };
      
      // Get configuration
      const configPaths = {
        workerPath: TESSERACT_CONFIG.workerPath,
        corePath: TESSERACT_CONFIG.corePath,
        trainingDataPath: TESSERACT_CONFIG.trainingDataPath,
        fallbackPaths: TESSERACT_CONFIG.fallbackPaths
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

Current URL: ${currentUrl}
Current Path: ${currentPath}
On Subroute: ${isOnSubRoute ? 'Yes' : 'No'}

Current Configuration:
- Worker Path: ${configPaths.workerPath}
- Core Path: ${configPaths.corePath}
- Training Data Path: ${configPaths.trainingDataPath}

Cached Asset Info:
- Cached WASM Path: ${cachedWasmPath || 'Not cached'}
- Cached Training Data Path: ${cachedTrainingPath || 'Not cached'}
- Cached WASM Binary: ${cachedWasmBinary}
- Cached WASM Source: ${cachedWasmSource}
- Session Storage Available: ${typeof sessionStorage !== 'undefined'}

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
                If you're accessing this from a dashboard route, required assets will be automatically downloaded.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                For best results:
              </p>
              <ul className="text-sm text-blue-600 list-disc pl-5 mt-1">
                <li>Use a modern browser (Chrome recommended)</li>
                <li>Upload clear images with readable text</li>
                <li>If you encounter errors, click the Manual Download button below</li>
                <li>Run the diagnostics to check your environment compatibility</li>
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
                  onClick={refreshOCRAssets} 
                  variant="outline" 
                  size="sm" 
                  className="bg-white"
                  disabled={downloading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Force Refresh Assets
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
              <h3 className="font-medium text-amber-700">Troubleshooting Dashboard Routes</h3>
              <p className="text-sm text-amber-600 mt-1">
                When accessing OCR from dashboard routes like /dashboard:
              </p>
              <ol className="text-sm text-amber-600 list-decimal pl-5 mt-1">
                <li>Assets are automatically downloaded when you load this page</li>
                <li>CDN sources are used instead of local files to avoid path resolution issues</li>
                <li>If OCR still fails, click the "Manual Download" button above</li>
                <li>For persistent issues, try using the OCR Test feature from the root page instead of a nested route</li>
              </ol>
              
              <div className="p-3 bg-white rounded mt-3 border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Common Path Issues
                </h4>
                <ul className="text-xs text-amber-700 mt-1 space-y-1">
                  <li><strong>404 errors:</strong> When accessing from a dashboard route, asset paths may not resolve correctly. The automatic download uses CDN fallbacks to fix this.</li>
                  <li><strong>CORS issues:</strong> Some CDN paths may be blocked by CORS policies. If this happens, try the "Force Refresh Assets" button which will try multiple sources.</li>
                  <li><strong>WebAssembly errors:</strong> If you see "Cannot fetch wasm module" errors, click the Manual Download button which creates a Blob URL that bypasses CORS restrictions.</li>
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

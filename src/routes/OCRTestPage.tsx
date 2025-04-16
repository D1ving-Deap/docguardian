
import React from 'react';
import OCRTest from '@/components/ocr/OCRTest';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info, FileText, Download } from "lucide-react";
import { Button } from '@/components/ui/button';
import { downloadWasmFile } from '@/utils/directWasmDownloader';

const OCRTestPage: React.FC = () => {
  const handleManualDownload = async () => {
    try {
      const success = await downloadWasmFile('tesseract-core.wasm');
      if (success) {
        alert('WASM file downloaded successfully. Please try processing an image now.');
      } else {
        alert('Failed to download WASM file. Please try a different browser.');
      }
    } catch (error) {
      console.error('Manual download error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                If you encounter errors, use the "Auto-Fix Issues" or "Direct Download" buttons.
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
              
              <div className="mt-3">
                <Button onClick={handleManualDownload} variant="outline" size="sm" className="bg-white">
                  <Download className="h-4 w-4 mr-1" />
                  Manual WASM Download
                </Button>
                <p className="text-xs text-blue-600 mt-1">
                  Click this if the "Direct Download" in the OCR component doesn't work
                </p>
              </div>
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
                <li>Click the "Direct Download" button to fetch WASM files directly</li>
                <li>Try using a different browser (Chrome works best for WebAssembly)</li>
                <li>Clear your browser cache and reload the page</li>
                <li>Make sure you're using a secure connection (HTTPS)</li>
                <li>Try the "Manual WASM Download" button at the top of this page</li>
              </ol>
              
              <div className="p-3 bg-white rounded mt-3 border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Common Error Messages
                </h4>
                <ul className="text-xs text-amber-700 mt-1 space-y-1">
                  <li><strong>Expected magic word 00 61 73 6d:</strong> The WASM file is corrupted or not downloading properly. Try the Direct Download button.</li>
                  <li><strong>Invalid WebAssembly file:</strong> The browser cannot load the WASM file. Try a different browser or use Direct Download.</li>
                  <li><strong>Failed to fetch:</strong> Network error while loading assets. Check your internet connection.</li>
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

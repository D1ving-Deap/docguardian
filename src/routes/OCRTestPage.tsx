
import React from 'react';
import OCRTest from '@/components/ocr/OCRTest';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";

const OCRTestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4 text-center">OCR Test Page</h1>
      
      <Card className="mb-6 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
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
                <li>Use a modern browser (Chrome, Firefox, Edge)</li>
                <li>Upload clear images with readable text</li>
                <li>Try JPG or PNG formats for best compatibility</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex">
            <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-700">Troubleshooting WebAssembly Issues</h3>
              <p className="text-sm text-amber-600 mt-1">
                If you see "WebAssembly file is corrupted or missing" errors:
              </p>
              <ol className="text-sm text-amber-600 list-decimal pl-5 mt-1">
                <li>Click the "Direct Download" button to fetch WASM files directly</li>
                <li>If that fails, try in a different browser (Chrome works best)</li>
                <li>Ensure your browser supports WebAssembly and is up-to-date</li>
                <li>Make sure you're using a secure connection (HTTPS)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <OCRTest />
    </div>
  );
};

export default OCRTestPage;

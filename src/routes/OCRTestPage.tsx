
import React from 'react';
import OCRTest from '@/components/ocr/OCRTest';

const OCRTestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">OCR Test Page</h1>
      <OCRTest />
    </div>
  );
};

export default OCRTestPage;

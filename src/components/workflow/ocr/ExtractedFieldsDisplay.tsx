
import React from 'react';
import { ExtractedFields } from '@/utils/ocrService';

interface ExtractedFieldsDisplayProps {
  extractedFields: ExtractedFields;
}

const ExtractedFieldsDisplay: React.FC<ExtractedFieldsDisplayProps> = ({ extractedFields }) => {
  if (!extractedFields || Object.keys(extractedFields).length === 0) {
    return null;
  }
  
  return (
    <div className="border rounded-md p-3 bg-gray-50">
      <h4 className="text-sm font-medium mb-2">Extracted Information</h4>
      <div className="space-y-1">
        {Object.entries(extractedFields).map(([key, value]) => {
          if (key === "metadata") return null;
          return (
            <div key={key} className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-gray-500 col-span-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
              <span className="col-span-2 font-medium">{value as string}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtractedFieldsDisplay;

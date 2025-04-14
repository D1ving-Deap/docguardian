
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface IssuesDisplayProps {
  issues: Array<{ severity: string; message: string }>;
}

const IssuesDisplay: React.FC<IssuesDisplayProps> = ({ issues }) => {
  if (!issues || issues.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
      <div className="flex items-center text-yellow-700 mb-1">
        <AlertTriangle className="h-4 w-4 mr-1" />
        <span className="font-medium text-sm">Potential Issues</span>
      </div>
      <ul className="text-xs text-yellow-800 pl-6 list-disc">
        {issues.map((issue, i) => (
          <li key={i}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default IssuesDisplay;

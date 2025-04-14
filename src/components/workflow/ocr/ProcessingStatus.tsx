
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  isProcessing: boolean;
  processingStage: string;
  progress: number;
  onProcess: () => void;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  processingStage,
  progress,
  onProcess
}) => {
  if (isProcessing) {
    return (
      <div className="space-y-3">
        {processingStage && (
          <p className="text-xs text-muted-foreground">{processingStage}</p>
        )}
        <Progress value={progress} className="h-2" />
      </div>
    );
  }
  
  return (
    <Button 
      onClick={onProcess} 
      className="w-full"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Process Document"
      )}
    </Button>
  );
};

export default ProcessingStatus;

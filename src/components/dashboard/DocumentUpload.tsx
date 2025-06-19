import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, X, Loader2, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase, supabaseUrl } from "@/integrations/supabase/client";
import storage from '@/utils/supabaseStorage';
import { performOCR, extractFieldsFromText } from '@/utils/ocrService';
import { processDocumentWorkflow } from '@/utils/workflowAutomation';
import { categorizeDocument } from '@/utils/documentCategorization';
import { runComplianceCheck, ApplicationData } from '@/utils/complianceEngine';
import { Badge } from "@/components/ui/badge";

interface DocumentUploadProps {
  label: string;
  description?: string;
  acceptTypes?: string;
  documentType: string;
  applicationId: string;
  onChange?: (documentId: string | null, extractedData?: any) => void;
}

const DocumentUpload = ({ 
  label, 
  description, 
  acceptTypes = "application/pdf,image/jpeg,image/png,image/tiff", 
  documentType,
  applicationId,
  onChange 
}: DocumentUploadProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [workflowActions, setWorkflowActions] = useState<string[]>([]);
  const [complianceResults, setComplianceResults] = useState<any>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!selectedFile.type.includes('pdf') && 
          !selectedFile.type.includes('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file or image (JPG, PNG, TIFF)",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadedDocId(null);
      setExtractedData(null);
      setWorkflowActions([]);
      setComplianceResults(null);
    }
  };
  
  const extractTextWithTesseract = async (imageUrl: string): Promise<{ text: string, extractedFields?: any }> => {
    setProcessingStatus('Initializing AI-powered OCR engine...');
    
    try {
      // Convert URL to File object for processing
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'document.png', { type: blob.type });
      
      setProcessingStatus('Extracting text with advanced AI...');
      
      // Use the WASM-based OCR engine
      const result = await performOCR(file, (progress) => {
        setProcessingStatus(`AI processing document: ${Math.round(progress * 100)}%`);
      });
      
      setProcessingStatus('Analyzing document structure...');
      
      // Auto-categorize the document
      const categorization = categorizeDocument(result.text, file.name);
      
      setProcessingStatus('Extracting structured data fields...');
      const extractedFields = extractFieldsFromText(result.text, categorization.type);
      
      return { 
        text: result.text,
        extractedFields: {
          ...extractedFields,
          categorization: categorization
        }
      };
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to extract text from document');
    }
  };

  const handleUpload = async () => {
    if (!file || !applicationId) return;
    
    setIsUploading(true);
    setProcessingStatus('Uploading document securely...');
    
    try {
      const timestamp = new Date().getTime();
      const safeName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.-]/g, '_'));
      const filePath = `${applicationId}/${documentType}/${timestamp}_${safeName}`;
      const uploadResult = await storage.uploadFile(
        file,
        'applications',
        filePath
      );
      
      if ('error' in uploadResult) {
        throw new Error(uploadResult.error);
      }
      
      setProcessingStatus('Processing document with AI OCR engine...');
      
      let ocrResult: { text: string, extractedFields?: any } = { text: '' };
      
      const objectUrl = URL.createObjectURL(file);
      
      try {
        ocrResult = await extractTextWithTesseract(objectUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
      
      setProcessingStatus('Saving document metadata...');
      
      const documentId = crypto.randomUUID();
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          id: documentId,
          application_id: applicationId,
          document_type: ocrResult.extractedFields?.categorization?.type || documentType,
          filename: file.name,
          file_path: uploadResult.key,
          raw_text: ocrResult.text || '',
          structured_data: ocrResult.extractedFields || {}
        })
        .select();
      
      if (docError) {
        console.error('Error storing document metadata:', docError);
        throw new Error(`Database error: ${docError.message}`);
      }
      
      setProcessingStatus('Running workflow automation...');
      
      // Trigger workflow automation
      const workflowResult = await processDocumentWorkflow(
        documentId,
        applicationId,
        ocrResult.text,
        ocrResult.extractedFields || {},
        file.name
      );
      
      setWorkflowActions(workflowResult.actions);
      
      setProcessingStatus('Performing compliance checks...');
      
      // Run compliance checks
      try {
        // Get application data for compliance check
        const { data: appData } = await supabase
          .from('mortgage_applications')
          .select('*')
          .eq('id', applicationId)
          .single();
        
        const { data: allDocs } = await supabase
          .from('documents')
          .select('*')
          .eq('application_id', applicationId);
        
        if (appData && allDocs) {
          const complianceData: ApplicationData = {
            applicantInfo: {
              name: appData.client_name,
              income: ocrResult.extractedFields?.income ? parseFloat(String(ocrResult.extractedFields.income).replace(/[^0-9.]/g, '')) : undefined
            },
            documents: allDocs.map(doc => ({
              type: doc.document_type as any,
              extractedFields: doc.structured_data || {},
              verified: doc.verified || false,
              uploadDate: doc.uploaded_at
            })),
            propertyInfo: {},
            loanInfo: {}
          };
          
          const complianceResult = runComplianceCheck(complianceData);
          setComplianceResults(complianceResult);
        }
      } catch (complianceError) {
        console.warn('Compliance check failed:', complianceError);
      }
      
      setProcessingStatus('Running fraud detection checks...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          applicationId,
          documentType: ocrResult.extractedFields?.categorization?.type || documentType,
          extractedText: ocrResult.text,
          extractedFields: ocrResult.extractedFields
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Fraud detection warning:', errorData.error);
      }
      
      toast({
        title: "Document Processed Successfully",
        description: workflowResult.newStage 
          ? `Document processed and application advanced to ${workflowResult.newStage}` 
          : "Document uploaded and processed with AI analysis"
      });
      
      setUploadedDocId(documentId);
      setExtractedData(ocrResult.extractedFields);
      
      if (onChange) {
        onChange(documentId, ocrResult.extractedFields);
      }
    } catch (error: any) {
      console.error('Document processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setProcessingStatus('');
    }
  };
  
  const handleRemove = async () => {
    setFile(null);
    setUploadedDocId(null);
    setExtractedData(null);
    setWorkflowActions([]);
    setComplianceResults(null);
    
    if (onChange) {
      onChange(null);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{label}</div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      {!file ? (
        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
          <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            Upload PDF or image for instant AI-powered analysis and workflow automation
          </p>
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}>
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>Choose File</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {!uploadedDocId ? (
            <div className="space-y-3">
              {processingStatus && (
                <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                  {processingStatus}
                </div>
              )}
              
              <Button 
                onClick={handleUpload} 
                disabled={isUploading} 
                className="w-full"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process with AI & Automation
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-green-600 text-sm bg-green-50 p-2 rounded">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Document processed successfully with AI analysis
              </div>
              
              {/* Workflow Actions */}
              {workflowActions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h5 className="font-medium text-blue-800 text-sm mb-2">Workflow Automation:</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {workflowActions.map((action, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-2 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Compliance Results */}
              {complianceResults && (
                <div className={`border rounded p-3 ${complianceResults.passed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <h5 className={`font-medium text-sm mb-2 ${complianceResults.passed ? 'text-green-800' : 'text-yellow-800'}`}>
                    Compliance Check:
                  </h5>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Score: {complianceResults.score}/100</span>
                    <Badge variant={complianceResults.passed ? "default" : "secondary"}>
                      {complianceResults.passed ? 'COMPLIANT' : 'REVIEW REQUIRED'}
                    </Badge>
                  </div>
                  {complianceResults.violations.length > 0 && (
                    <div className="text-xs space-y-1">
                      {complianceResults.violations.slice(0, 2).map((violation: any, index: number) => (
                        <div key={index} className="flex items-center text-yellow-700">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {violation.message}
                        </div>
                      ))}
                      {complianceResults.violations.length > 2 && (
                        <div className="text-xs text-gray-600">
                          +{complianceResults.violations.length - 2} more issues...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Data */}
              {extractedData && Object.keys(extractedData).length > 0 && (
                <div className="border rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-sm mb-2">AI Extracted Information:</h5>
                  
                  {/* Document Categorization */}
                  {extractedData.categorization && (
                    <div className="mb-3 p-2 bg-blue-100 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-800">Auto-Categorized:</span>
                        <Badge variant="outline" className="text-xs">
                          {extractedData.categorization.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Confidence: {Math.round(extractedData.categorization.confidence * 100)}%
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1 text-sm">
                    {Object.entries(extractedData).map(([key, value]) => {
                      if (key === "metadata" || key === "categorization") return null;
                      
                      return (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium text-xs">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                          </span>
                          <span className="col-span-2 text-xs font-mono bg-white p-1 rounded">
                            {value as string}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;

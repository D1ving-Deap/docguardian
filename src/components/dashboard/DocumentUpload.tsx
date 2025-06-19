import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Eye,
  Download,
  Trash2,
  Shield,
  Clock,
  User,
  Building,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { performOCR, extractFieldsFromText } from '@/utils/ocrService';
import { categorizeDocument, validateExtractedFields } from '@/utils/documentCategorization';
import { processDocumentAndTriggerWorkflow, createMortgageApplication } from '@/utils/workflowAutomation';
import { runComplianceCheck, generateComplianceReport } from '@/utils/complianceEngine';
import { DocumentType } from '@/utils/types/ocrTypes';
import { MortgageApplication, ApplicationDocument } from '@/utils/workflowAutomation';

interface UploadedDocument {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  ocrResult?: any;
  extractedFields?: Record<string, any>;
  documentType?: DocumentType;
  confidence?: number;
  issues?: string[];
  isVerified?: boolean;
  verificationNotes?: string;
}

interface DocumentUploadProps {
  applicationId?: string;
  onDocumentProcessed?: (document: ApplicationDocument) => void;
  onApplicationUpdated?: (application: MortgageApplication) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  applicationId,
  onDocumentProcessed,
  onApplicationUpdated
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [currentApplication, setCurrentApplication] = useState<MortgageApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const { toast } = useToast();

  // Initialize application if not provided
  React.useEffect(() => {
    if (!currentApplication && !applicationId) {
      const newApplication = createMortgageApplication({
        applicantName: 'New Applicant',
        email: 'applicant@example.com',
        phone: '(555) 123-4567',
        propertyAddress: '123 Main St, Toronto, ON',
        purchasePrice: 500000,
        downPayment: 50000,
        loanAmount: 450000
      });
      setCurrentApplication(newApplication);
    }
  }, [applicationId, currentApplication]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newDocuments: UploadedDocument[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    setUploadedDocuments(prev => [...prev, ...newDocuments]);

    // Process each document
    for (const doc of newDocuments) {
      await processDocument(doc);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const processDocument = async (document: UploadedDocument) => {
    try {
      // Update status to processing
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'processing', progress: 10 }
            : doc
        )
      );

      // Perform OCR
      const ocrResult = await performOCR(document.file);
      
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, progress: 40, ocrResult }
            : doc
        )
      );

      // Extract fields from OCR text
      const extractedFields = await extractFieldsFromText(ocrResult.text, document.file.name);
      
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, progress: 60, extractedFields }
            : doc
        )
      );

      // Categorize document
      const categorization = categorizeDocument(ocrResult.text, document.file.name);
      
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { 
                ...doc, 
                progress: 80, 
                documentType: categorization.type,
                confidence: categorization.confidence,
                issues: categorization.reasons
              }
            : doc
        )
      );

      // Validate extracted fields
      const validation = validateExtractedFields(extractedFields, categorization.type);

      // Create application document
      const applicationDocument: ApplicationDocument = {
        id: document.id,
        type: categorization.type,
        filename: document.file.name,
        uploadedAt: new Date(),
        processedAt: new Date(),
        extractedFields,
        confidence: categorization.confidence,
        issues: validation.missingFields,
        isVerified: validation.isComplete,
        verificationNotes: validation.isComplete ? 'All required fields extracted' : `Missing: ${validation.missingFields.join(', ')}`
      };

      // Update document status
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { 
                ...doc, 
                status: 'completed', 
                progress: 100,
                isVerified: validation.isComplete,
                verificationNotes: applicationDocument.verificationNotes
              }
            : doc
        )
      );

      // Process workflow automation if application exists
      if (currentApplication) {
        const { updatedApplication, triggeredActions } = processDocumentAndTriggerWorkflow(
          currentApplication,
          applicationDocument
        );

        setCurrentApplication(updatedApplication);

        // Run compliance check
        const compliance = runComplianceCheck(updatedApplication);
        setComplianceResult(compliance);

        // Notify parent components
        onDocumentProcessed?.(applicationDocument);
        onApplicationUpdated?.(updatedApplication);

        // Show notifications for triggered actions
        if (triggeredActions.length > 0) {
          toast({
            title: "Workflow Automation Triggered",
            description: `${triggeredActions.length} automation rules were triggered`,
          });
        }

        // Show compliance status
        if (compliance.overallStatus === 'non_compliant') {
          toast({
            title: "Compliance Issues Detected",
            description: `${compliance.summary.failed} compliance checks failed`,
            variant: "destructive",
          });
        } else if (compliance.overallStatus === 'needs_review') {
          toast({
            title: "Compliance Review Required",
            description: `${compliance.summary.warnings} warnings detected`,
            variant: "default",
          });
        }
      }

    } catch (error) {
      console.error('Error processing document:', error);
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'error', progress: 0 }
            : doc
        )
      );

      toast({
        title: "Processing Error",
        description: `Failed to process ${document.file.name}`,
        variant: "destructive",
      });
    }
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getDocumentIcon = (type?: DocumentType) => {
    switch (type) {
      case 'mortgage_application':
        return <FileText className="h-4 w-4" />;
      case 'income_proof':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_statement':
        return <Building className="h-4 w-4" />;
      case 'identification':
        return <User className="h-4 w-4" />;
      case 'tax_document':
        return <FileCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'uploading':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getDocumentTypeColor = (type?: DocumentType) => {
    switch (type) {
      case 'mortgage_application':
        return 'bg-blue-100 text-blue-800';
      case 'income_proof':
        return 'bg-green-100 text-green-800';
      case 'bank_statement':
        return 'bg-purple-100 text-purple-800';
      case 'identification':
        return 'bg-orange-100 text-orange-800';
      case 'tax_document':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload & Processing
          </CardTitle>
          <CardDescription>
            Upload mortgage documents for AI-powered OCR extraction, categorization, and compliance checking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop documents here'}
            </p>
            <p className="text-gray-500 mb-4">
              or click to select files
            </p>
            <p className="text-sm text-gray-400">
              Supports: PDF, PNG, JPG, JPEG, GIF, BMP, TIFF
            </p>
          </div>
        </CardContent>
      </Card>

      {uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-4">
                <ScrollArea className="h-96">
                  {uploadedDocuments.map((document) => (
                    <div key={document.id} className="border rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {getDocumentIcon(document.documentType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm truncate">
                                {document.file.name}
                              </h4>
                              {getStatusIcon(document.status)}
                              {document.documentType && (
                                <Badge className={getDocumentTypeColor(document.documentType)}>
                                  {document.documentType.replace('_', ' ')}
                                </Badge>
                              )}
                              {document.isVerified && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <Progress value={document.progress} className="mb-2" />
                            
                            {document.confidence && (
                              <p className="text-sm text-gray-600">
                                Confidence: {Math.round(document.confidence * 100)}%
                              </p>
                            )}
                            
                            {document.issues && document.issues.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-red-600 font-medium">Issues:</p>
                                <ul className="text-sm text-red-600">
                                  {document.issues.map((issue, index) => (
                                    <li key={index}>• {issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {document.verificationNotes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {document.verificationNotes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(document.preview, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                {complianceResult ? (
                  <div className="space-y-4">
                    <Alert className={complianceResult.overallStatus === 'compliant' ? 'border-green-200 bg-green-50' : 
                                     complianceResult.overallStatus === 'non_compliant' ? 'border-red-200 bg-red-50' : 
                                     'border-yellow-200 bg-yellow-50'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Overall Status:</strong> {complianceResult.overallStatus.toUpperCase()}
                        <br />
                        <strong>Summary:</strong> {complianceResult.summary.passed} passed, {complianceResult.summary.failed} failed, {complianceResult.summary.warnings} warnings
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(complianceResult.checks.reduce((acc, check) => {
                        if (!acc[check.type]) acc[check.type] = [];
                        acc[check.type].push(check);
                        return acc;
                      }, {} as Record<string, any[]>)).map(([regulatoryBody, checks]) => (
                        <Card key={regulatoryBody}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{regulatoryBody.toUpperCase()}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {checks.map((check) => (
                                <div key={check.id} className="flex items-center gap-2">
                                  {check.status === 'passed' ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : check.status === 'failed' ? (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                  )}
                                  <span className="text-xs">{check.description}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4" />
                    <p>Upload documents to see compliance results</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="workflow" className="space-y-4">
                {currentApplication ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Application Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Stage</p>
                            <p className="text-lg font-semibold">{currentApplication.stage.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Status</p>
                            <p className="text-lg font-semibold">{currentApplication.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Next Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentApplication.nextActions.map((action, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {currentApplication.blockers.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-red-600">Blockers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {currentApplication.blockers.map((blocker, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm">{blocker}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4" />
                    <p>Upload documents to see workflow status</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;

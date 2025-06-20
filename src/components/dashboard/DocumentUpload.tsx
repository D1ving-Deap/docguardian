import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Edit,
  Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import OCRService, { type ExtractedField } from '@/utils/ocrService';
import { useAppData } from '@/contexts/AppDataContext';
import { supabase } from '@/integrations/supabase/client';

interface ExtractedData {
  [key: string]: string;
}

interface DocumentUploadProps {
  documentType: 'income_proof' | 'bank_statement' | 'identification' | 'tax_document' | 'mortgage_application' | 'generic';
  onDataExtracted: (data: ExtractedData) => void;
  onManualDataEntered: (data: ExtractedData) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  onDataExtracted,
  onManualDataEntered
}) => {
  const { toast } = useToast();
  const { userProfile, createApplication } = useAppData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [manualData, setManualData] = useState<ExtractedData>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const ocrServiceRef = useRef<OCRService | null>(null);

  useEffect(() => {
    ocrServiceRef.current = new OCRService();
    ocrServiceRef.current.initialize(
      (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
          setProgressMessage('Recognizing text...');
        } else {
          setProgressMessage(m.status);
        }
      }
    );

    return () => {
      ocrServiceRef.current?.terminate();
    };
  }, []);

  // Document type configurations
  const documentConfigs = {
    income_proof: {
      title: 'Income Proof',
      description: 'Upload pay stubs, employment letters, or income verification documents',
      fields: ['employer_name', 'job_title', 'annual_salary', 'employment_date', 'pay_frequency'],
      fieldLabels: {
        employer_name: 'Employer Name',
        job_title: 'Job Title',
        annual_salary: 'Annual Salary',
        employment_date: 'Employment Date',
        pay_frequency: 'Pay Frequency'
      }
    },
    bank_statement: {
      title: 'Bank Statement',
      description: 'Upload recent bank statements for account verification',
      fields: ['bank_name', 'account_number', 'account_balance', 'statement_date', 'account_type'],
      fieldLabels: {
        bank_name: 'Bank Name',
        account_number: 'Account Number (Last 4 digits)',
        account_balance: 'Account Balance',
        statement_date: 'Statement Date',
        account_type: 'Account Type'
      }
    },
    identification: {
      title: 'Identification',
      description: 'Upload government-issued ID (driver\'s license, passport, etc.)',
      fields: ['full_name', 'date_of_birth', 'id_number', 'expiry_date', 'issuing_authority'],
      fieldLabels: {
        full_name: 'Full Name',
        date_of_birth: 'Date of Birth',
        id_number: 'ID Number',
        expiry_date: 'Expiry Date',
        issuing_authority: 'Issuing Authority'
      }
    },
    tax_document: {
      title: 'Tax Document',
      description: 'Upload tax returns or T4 slips',
      fields: ['tax_year', 'total_income', 'employer_name', 'sin_number', 'filing_status'],
      fieldLabels: {
        tax_year: 'Tax Year',
        total_income: 'Total Income',
        employer_name: 'Employer Name',
        sin_number: 'SIN Number (Last 4 digits)',
        filing_status: 'Filing Status'
      }
    },
    mortgage_application: {
      title: 'Mortgage Application',
      description: 'Upload completed mortgage application form',
      fields: ['applicant_name', 'property_address', 'purchase_price', 'down_payment', 'loan_amount'],
      fieldLabels: {
        applicant_name: 'Applicant Name',
        property_address: 'Property Address',
        purchase_price: 'Purchase Price',
        down_payment: 'Down Payment',
        loan_amount: 'Loan Amount'
      }
    },
    generic: {
      title: 'Document',
      description: 'Upload any other relevant document',
      fields: [],
      fieldLabels: {}
    }
  };

  const config = documentConfigs[documentType];

  const saveToSupabase = async (extractedData: ExtractedData, file: File) => {
    if (!userProfile) {
      throw new Error('User profile not loaded');
    }

    try {
      // First, create or get the mortgage application
      let applicationId = '';
      if (userProfile.role === 'applicant') {
        // Create a new mortgage application for applicants
        const { data: appData, error: appError } = await supabase
          .from('mortgage_applications')
          .insert([{
            client_name: userProfile.full_name || 'Unknown',
            email: userProfile.email || '',
            status: 'in_progress',
            stage: 'Document Collection',
            progress: 25
          }])
          .select()
          .single();
        
        if (appError) throw appError;
        applicationId = appData.id;
      } else {
        // For other roles, get the current application
        const { data: apps, error: appError } = await supabase
          .from('mortgage_applications')
          .select('id')
          .eq('email', userProfile.email)
          .limit(1);
        
        if (appError) throw appError;
        applicationId = apps?.[0]?.id || '';
      }

      if (!applicationId) {
        throw new Error('No application found');
      }

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([{
          application_id: applicationId,
          document_type: documentType,
          file_path: fileName,
          filename: file.name,
          raw_text: JSON.stringify(extractedData),
          structured_data: extractedData,
          verified: false
        }])
        .select()
        .single();

      if (docError) throw docError;

      toast({
        title: "Document saved successfully",
        description: "Your document and extracted data have been saved to the database.",
      });

    } catch (error) {
      console.error('Error saving to Supabase:', error);
      toast({
        title: "Error saving document",
        description: "There was an error saving your document to the database.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleProcessDocument = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !ocrServiceRef.current) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProgress(0);
    setExtractedData({});

    try {
      const { extractedFields } = await ocrServiceRef.current.analyzeDocument(file);
      
      const data: ExtractedData = extractedFields.reduce((acc, field) => {
        acc[field.label.toLowerCase().replace(/\s+/g, '_')] = field.value;
        return acc;
      }, {} as ExtractedData);
      
      setExtractedData(data);
      await saveToSupabase(data, file);
      onDataExtracted(data);
      
      toast({
        title: "Document processed successfully",
        description: "OCR extraction completed. Please review the extracted data.",
      });

    } catch (error) {
      console.error("OCR Processing Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Processing failed",
        description: `There was an error processing your document: ${errorMessage}. Please check the console for details.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onDataExtracted, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleProcessDocument,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleManualDataSubmit = () => {
    onManualDataEntered(manualData);
    toast({
      title: 'Manual data saved!',
      description: 'Your manually entered data has been saved.',
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-muted-foreground/25 hover:border-primary/50 dark:border-muted-foreground/50 dark:hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop a file here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, JPG, PNG, and other image formats
                </p>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{progressMessage || 'Processing...'}</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {uploadedFile && !isProcessing && (
            <div className="mt-4 p-4 bg-muted/50 dark:bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewUrl('');
                    setExtractedData({});
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Data */}
      {Object.keys(extractedData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              Extracted Data
            </CardTitle>
            <CardDescription>
              Review and edit the automatically extracted information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="text-sm font-medium">
                    {config.fieldLabels[field]}
                  </Label>
                  <Input
                    id={field}
                    value={extractedData[field] || ''}
                    onChange={(e) => {
                      const newData = { ...extractedData, [field]: e.target.value };
                      setExtractedData(newData);
                    }}
                    className="bg-background border-border"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => onDataExtracted(extractedData)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Use Extracted Data
              </Button>
              <Button variant="outline" onClick={() => setExtractedData({})}>
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Manual Data Entry
          </CardTitle>
          <CardDescription>
            Enter information manually if you prefer not to upload documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={`manual-${field}`} className="text-sm font-medium">
                  {config.fieldLabels[field]}
                </Label>
                <Input
                  id={`manual-${field}`}
                  value={manualData[field] || ''}
                  onChange={(e) => {
                    const newData = { ...manualData, [field]: e.target.value };
                    setManualData(newData);
                  }}
                  className="bg-background border-border"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={handleManualDataSubmit}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Manual Data
            </Button>
            <Button variant="outline" onClick={() => setManualData({})}>
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;

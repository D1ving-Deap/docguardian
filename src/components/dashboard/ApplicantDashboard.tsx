import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Upload,
  Eye,
  Download,
  Calendar,
  Home,
  DollarSign,
  Shield,
  FileCheck,
  AlertTriangle,
  Info,
  MessageCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { MortgageApplication, ApplicationStage, ApplicationStatus } from '@/utils/workflowAutomation';
import { DocumentType } from '@/utils/types/ocrTypes';
import DocumentUpload from './DocumentUpload';

// Mock applicant data
const mockApplicantApplication: MortgageApplication = {
  id: 'app-001',
  applicantId: 'applicant-001',
  applicantName: 'John Smith',
  email: 'john.smith@email.com',
  phone: '(555) 123-4567',
  propertyAddress: '123 Main St, Toronto, ON',
  purchasePrice: 750000,
  downPayment: 75000,
  loanAmount: 675000,
  stage: 'document_collection',
  status: 'in_progress',
  documents: [
    {
      id: 'doc-001',
      type: 'mortgage_application',
      filename: 'mortgage_application.pdf',
      uploadedAt: new Date('2024-01-15'),
      processedAt: new Date('2024-01-15'),
      extractedFields: { 
        applicantName: 'John Smith', 
        propertyAddress: '123 Main St',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567'
      },
      confidence: 0.95,
      issues: [],
      isVerified: true,
      verificationNotes: 'Application form completed successfully'
    }
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-16'),
  lastActivity: new Date('2024-01-16'),
  brokerId: 'broker-001',
  brokerNotes: 'Application received, waiting for additional documents',
  complianceChecks: [],
  nextActions: [
    'Upload recent pay stubs (last 3 months)',
    'Upload bank statements (last 3 months)',
    'Upload government-issued ID',
    'Upload T4 or Notice of Assessment'
  ],
  blockers: [
    'Missing income verification documents',
    'Missing bank statements for down payment verification'
  ]
};

const ApplicantDashboard: React.FC = () => {
  const [application, setApplication] = useState<MortgageApplication>(mockApplicantApplication);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate application progress
  const stageOrder: ApplicationStage[] = [
    'initial_submission',
    'document_collection',
    'document_review',
    'underwriting',
    'conditional_approval',
    'final_approval',
    'closing',
    'funded'
  ];

  const currentStageIndex = stageOrder.indexOf(application.stage);
  const progressPercentage = ((currentStageIndex + 1) / stageOrder.length) * 100;

  const getStageColor = (stage: ApplicationStage) => {
    switch (stage) {
      case 'initial_submission':
        return 'bg-gray-100 text-gray-800';
      case 'document_collection':
        return 'bg-blue-100 text-blue-800';
      case 'document_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'underwriting':
        return 'bg-purple-100 text-purple-800';
      case 'conditional_approval':
        return 'bg-orange-100 text-orange-800';
      case 'final_approval':
        return 'bg-green-100 text-green-800';
      case 'closing':
        return 'bg-indigo-100 text-indigo-800';
      case 'funded':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'mortgage_application':
        return <FileText className="h-4 w-4" />;
      case 'income_proof':
        return <DollarSign className="h-4 w-4" />;
      case 'bank_statement':
        return <Shield className="h-4 w-4" />;
      case 'identification':
        return <User className="h-4 w-4" />;
      case 'tax_document':
        return <FileCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentTypeColor = (type: DocumentType) => {
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

  const handleDocumentProcessed = (document: any) => {
    setApplication(prev => ({
      ...prev,
      documents: [...prev.documents, document],
      updatedAt: new Date(),
      lastActivity: new Date()
    }));
  };

  const handleApplicationUpdated = (updatedApp: MortgageApplication) => {
    setApplication(updatedApp);
  };

  const requiredDocumentTypes: DocumentType[] = [
    'mortgage_application',
    'income_proof',
    'bank_statement',
    'identification',
    'tax_document'
  ];

  const uploadedDocumentTypes = application.documents.map(doc => doc.type);
  const missingDocumentTypes = requiredDocumentTypes.filter(type => !uploadedDocumentTypes.includes(type));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Mortgage Application</h1>
          <p className="text-gray-600">Track your application progress and upload required documents</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact Broker
          </Button>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Application Progress
          </CardTitle>
          <CardDescription>
            Your mortgage application is currently in the {application.stage.replace('_', ' ')} stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {stageOrder.map((stage, index) => (
                <div key={stage} className="text-center">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium ${
                    index <= currentStageIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{stage.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{application.propertyAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Purchase Price: ${application.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Down Payment: ${application.downPayment.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Loan Amount: ${application.loanAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Stage:</span>
                <Badge className={getStageColor(application.stage)}>
                  {application.stage.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge className={getStatusColor(application.status)}>
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Started: {application.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Last Updated: {application.lastActivity.toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{application.applicantName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{application.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{application.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Document Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requiredDocumentTypes.map((docType) => {
                    const isUploaded = uploadedDocumentTypes.includes(docType);
                    const document = application.documents.find(doc => doc.type === docType);
                    
                    return (
                      <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(docType)}
                          <div>
                            <p className="font-medium text-sm">{docType.replace('_', ' ')}</p>
                            {document && (
                              <p className="text-xs text-gray-500">{document.filename}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUploaded ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <Badge className="bg-red-100 text-red-800">Required</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {application.documents
                      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
                      .map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{doc.filename}</p>
                            <p className="text-xs text-gray-500">
                              {doc.uploadedAt.toLocaleDateString()} - {doc.type.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge className={getDocumentTypeColor(doc.type)}>
                            {doc.isVerified ? 'Verified' : 'Processing'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload required documents for your mortgage application. Our AI will automatically extract and categorize the information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                applicationId={application.id}
                onDocumentProcessed={handleDocumentProcessed}
                onApplicationUpdated={handleApplicationUpdated}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="next-steps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Next Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Next Actions Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.nextActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Blockers */}
            {application.blockers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Items Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {application.blockers.map((blocker, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex-shrink-0 mt-1">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-sm text-red-700">{blocker}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Documents */}
            {missingDocumentTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <FileText className="h-5 w-5" />
                    Missing Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {missingDocumentTypes.map((docType) => (
                      <div key={docType} className="flex items-center gap-3 p-3 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex-shrink-0">
                          {getDocumentIcon(docType)}
                        </div>
                        <p className="text-sm text-orange-700">{docType.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stageOrder.map((stage, index) => {
                  const isCompleted = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  
                  return (
                    <div key={stage} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                          {stage.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicantDashboard; 
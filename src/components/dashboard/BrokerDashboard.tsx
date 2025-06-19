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
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Shield,
  Eye,
  Edit,
  Send,
  Download,
  BarChart3,
  Calendar,
  DollarSign,
  Home,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { MortgageApplication, ApplicationStage, ApplicationStatus } from '@/utils/workflowAutomation';
import { DocumentType } from '@/utils/types/ocrTypes';
import DocumentUpload from './DocumentUpload';
import ApplicationList from './ApplicationList';
import SmartAnalyticsDashboard from './SmartAnalyticsDashboard';
import RealTimeApplicationTracker from './RealTimeApplicationTracker';

// Mock data for demonstration
const mockApplications: MortgageApplication[] = [
  {
    id: 'app-001',
    applicantId: 'applicant-001',
    applicantName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    propertyAddress: '123 Main St, Toronto, ON',
    purchasePrice: 750000,
    downPayment: 75000,
    loanAmount: 675000,
    stage: 'underwriting',
    status: 'in_progress',
    documents: [
      {
        id: 'doc-001',
        type: 'mortgage_application',
        filename: 'mortgage_application.pdf',
        uploadedAt: new Date('2024-01-15'),
        processedAt: new Date('2024-01-15'),
        extractedFields: { applicantName: 'John Smith', propertyAddress: '123 Main St' },
        confidence: 0.95,
        issues: [],
        isVerified: true
      },
      {
        id: 'doc-002',
        type: 'income_proof',
        filename: 'pay_stub.pdf',
        uploadedAt: new Date('2024-01-16'),
        processedAt: new Date('2024-01-16'),
        extractedFields: { income: 85000, employer: 'Tech Corp' },
        confidence: 0.88,
        issues: [],
        isVerified: true
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    lastActivity: new Date('2024-01-16'),
    brokerId: 'broker-001',
    brokerNotes: 'Strong application, good credit score',
    complianceChecks: [],
    nextActions: ['Review underwriting decision', 'Send conditional approval'],
    blockers: []
  },
  {
    id: 'app-002',
    applicantId: 'applicant-002',
    applicantName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 987-6543',
    propertyAddress: '456 Oak Ave, Vancouver, BC',
    purchasePrice: 1200000,
    downPayment: 240000,
    loanAmount: 960000,
    stage: 'document_review',
    status: 'pending',
    documents: [
      {
        id: 'doc-003',
        type: 'mortgage_application',
        filename: 'mortgage_application_sarah.pdf',
        uploadedAt: new Date('2024-01-17'),
        processedAt: new Date('2024-01-17'),
        extractedFields: { applicantName: 'Sarah Johnson', propertyAddress: '456 Oak Ave' },
        confidence: 0.92,
        issues: [],
        isVerified: true
      }
    ],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    lastActivity: new Date('2024-01-17'),
    brokerId: 'broker-001',
    brokerNotes: 'Waiting for additional documents',
    complianceChecks: [],
    nextActions: ['Request bank statements', 'Request tax documents'],
    blockers: ['Missing income verification', 'Missing bank statements']
  }
];

const BrokerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<MortgageApplication[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<MortgageApplication | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate dashboard metrics
  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => app.status === 'in_progress').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const completedApplications = applications.filter(app => app.status === 'completed').length;

  const applicationsByStage = applications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStage, number>);

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

  const handleDocumentProcessed = (applicationId: string, document: any) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          documents: [...app.documents, document],
          updatedAt: new Date(),
          lastActivity: new Date()
        };
      }
      return app;
    }));
  };

  const handleApplicationUpdated = (applicationId: string, updatedApp: MortgageApplication) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? updatedApp : app
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broker Dashboard</h1>
          <p className="text-gray-600">Manage mortgage applications and monitor workflow automation</p>
        </div>
        <Button className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{activeApplications}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedApplications}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tracker">Live Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Stage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Applications by Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(applicationsByStage).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStageColor(stage as ApplicationStage)}>
                          {stage.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
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
                    {applications
                      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
                      .slice(0, 5)
                      .map((app) => (
                        <div key={app.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            <UserCheck className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{app.applicantName}</p>
                            <p className="text-xs text-gray-500">
                              {app.lastActivity.toLocaleDateString()} - {app.stage.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <ApplicationList 
            applications={applications}
            onApplicationSelect={setSelectedApplication}
            selectedApplication={selectedApplication}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Document Processing
              </CardTitle>
              <CardDescription>
                Upload and process mortgage documents with AI-powered OCR and categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedApplication ? (
                <DocumentUpload
                  applicationId={selectedApplication.id}
                  onDocumentProcessed={(doc) => handleDocumentProcessed(selectedApplication.id, doc)}
                  onApplicationUpdated={(app) => handleApplicationUpdated(selectedApplication.id, app)}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Select an application to upload documents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SmartAnalyticsDashboard applications={applications} />
        </TabsContent>

        <TabsContent value="tracker" className="space-y-6">
          <RealTimeApplicationTracker applications={applications} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrokerDashboard; 
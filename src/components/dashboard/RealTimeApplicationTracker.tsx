import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Clock, CheckCircle2, AlertTriangle, FileText, Users, 
  Zap, TrendingUp, Calendar, Bell, Eye
} from "lucide-react";
import { getWorkflowStatus, MORTGAGE_STAGES } from "@/utils/workflowAutomation";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationStatus {
  id: string;
  clientName: string;
  currentStage: string;
  progress: number;
  status: string;
  estimatedCompletion: string;
  lastUpdated: string;
  blockers: string[];
  nextActions: string[];
  urgency: 'low' | 'medium' | 'high';
  agent?: string;
}

interface RecentActivity {
  id: string;
  timestamp: string;
  type: 'document_uploaded' | 'stage_advanced' | 'issue_detected' | 'manual_review';
  message: string;
  applicationId: string;
  clientName: string;
}

const RealTimeApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTab, setSelectedTab] = useState("applications");
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for demonstration
  const mockApplications: ApplicationStatus[] = [
    {
      id: "APP-2024-001",
      clientName: "Emily Chen",
      currentStage: "Document Collection",
      progress: 25,
      status: "In Progress",
      estimatedCompletion: "Dec 15, 2024",
      lastUpdated: "2 minutes ago",
      blockers: ["Missing bank statement"],
      nextActions: ["Upload bank statement", "Verify income"],
      urgency: "medium",
      agent: "John Smith"
    },
    {
      id: "APP-2024-002",
      clientName: "Robert Johnson",
      currentStage: "Income Verification",
      progress: 65,
      status: "Under Review",
      estimatedCompletion: "Dec 10, 2024",
      lastUpdated: "15 minutes ago",
      blockers: ["Income variance detected"],
      nextActions: ["Manual review required"],
      urgency: "high",
      agent: "Sarah Wilson"
    },
    {
      id: "APP-2024-003",
      clientName: "Maria Santos",
      currentStage: "Property Appraisal",
      progress: 80,
      status: "Processing",
      estimatedCompletion: "Dec 8, 2024",
      lastUpdated: "1 hour ago",
      blockers: [],
      nextActions: ["Awaiting appraisal report"],
      urgency: "low",
      agent: "Michael Brown"
    },
    {
      id: "APP-2024-004",
      clientName: "David Kim",
      currentStage: "Final Underwriting",
      progress: 95,
      status: "Processing",
      estimatedCompletion: "Dec 5, 2024",
      lastUpdated: "30 minutes ago",
      blockers: [],
      nextActions: ["Final approval pending"],
      urgency: "low",
      agent: "John Smith"
    }
  ];

  const mockActivity: RecentActivity[] = [
    {
      id: "1",
      timestamp: "2 minutes ago",
      type: "document_uploaded",
      message: "Pay stub uploaded and processed",
      applicationId: "APP-2024-001",
      clientName: "Emily Chen"
    },
    {
      id: "2",
      timestamp: "15 minutes ago",
      type: "issue_detected",
      message: "Income variance detected - flagged for review",
      applicationId: "APP-2024-002",
      clientName: "Robert Johnson"
    },
    {
      id: "3",
      timestamp: "30 minutes ago",
      type: "stage_advanced",
      message: "Application advanced to Final Underwriting",
      applicationId: "APP-2024-004",
      clientName: "David Kim"
    },
    {
      id: "4",
      timestamp: "1 hour ago",
      type: "document_uploaded",
      message: "Property appraisal document uploaded",
      applicationId: "APP-2024-003",
      clientName: "Maria Santos"
    }
  ];

  useEffect(() => {
    // Simulate loading data
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setApplications(mockApplications);
        setRecentActivity(mockActivity);
        setIsLoading(false);
      }, 1000);
    };

    loadData();

    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(loadData, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'In Progress': return { variant: "default" as const, className: "bg-blue-500 text-white" };
      case 'Under Review': return { variant: "secondary" as const, className: "bg-yellow-500 text-white" };
      case 'Processing': return { variant: "default" as const, className: "bg-purple-500 text-white" };
      case 'Approved': return { variant: "default" as const, className: "bg-green-500 text-white" };
      case 'Rejected': return { variant: "destructive" as const };
      default: return { variant: "outline" as const };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_uploaded': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'stage_advanced': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'issue_detected': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'manual_review': return <Eye className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading application data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Real-Time Application Tracker</h1>
          <p className="text-gray-600">
            Live status updates and workflow monitoring for all mortgage applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className="w-4 h-4 mr-2" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Stages</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {applications.map((app) => (
              <Card key={app.id} className={`border-l-4 ${getUrgencyColor(app.urgency)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{app.clientName}</CardTitle>
                    <Badge {...getStatusBadgeProps(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {app.id} • Agent: {app.agent}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{app.currentStage}</span>
                      <span className="text-sm text-gray-500">{app.progress}%</span>
                    </div>
                    <Progress value={app.progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Est. completion: {app.estimatedCompletion}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Last updated: {app.lastUpdated}
                    </div>
                  </div>

                  {app.blockers.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-800 text-sm mb-1">Blockers:</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {app.blockers.map((blocker, index) => (
                          <li key={index} className="flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-2 flex-shrink-0" />
                            {blocker}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 text-sm mb-1">Next Actions:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {app.nextActions.map((action, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-2 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    View Application Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Activity Feed</CardTitle>
              <CardDescription>
                Live updates from all applications in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.clientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.applicationId} • {activity.timestamp}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Stages Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Stage Overview</CardTitle>
              <CardDescription>
                Applications distributed across mortgage processing stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MORTGAGE_STAGES.map((stage, index) => {
                  const stageApps = applications.filter(app => app.currentStage === stage.name);
                  const percentage = (stageApps.length / applications.length) * 100;
                  
                  return (
                    <div key={stage.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{stage.name}</h4>
                            <p className="text-sm text-gray-600">
                              {stageApps.length} applications • {percentage.toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {stageApps.length}
                        </Badge>
                      </div>
                      
                      <Progress value={percentage} className="h-2 mb-3" />
                      
                      {stageApps.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {stageApps.map(app => (
                            <div key={app.id} className="text-xs p-2 bg-gray-50 rounded border">
                              <div className="font-medium">{app.clientName}</div>
                              <div className="text-gray-600">{app.id}</div>
                              <div className="text-gray-500">{app.lastUpdated}</div>
                            </div>
                          ))}
                        </div>
                      )}
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

export default RealTimeApplicationTracker;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Users, FileCheck, Clock, AlertTriangle,
  DollarSign, Calendar, Target, BarChart3, PieChart, Activity
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalApplications: number;
    applicationsThisMonth: number;
    averageProcessingTime: number;
    approvalRate: number;
    fraudDetectionRate: number;
  };
  trends: Array<{
    date: string;
    applications: number;
    approvals: number;
    fraudAlerts: number;
  }>;
  documentStats: Array<{
    type: string;
    count: number;
    averageProcessingTime: number;
    fraudRate: number;
  }>;
  stageDistribution: Array<{
    stage: string;
    count: number;
    averageTime: number;
  }>;
  agentPerformance: Array<{
    agent: string;
    applications: number;
    avgProcessingTime: number;
    approvalRate: number;
    fraudCaught: number;
  }>;
}

const SmartAnalyticsDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Simulated data - in real implementation, this would come from your backend
  const mockData: AnalyticsData = {
    overview: {
      totalApplications: 247,
      applicationsThisMonth: 89,
      averageProcessingTime: 12.5,
      approvalRate: 78.2,
      fraudDetectionRate: 5.3
    },
    trends: [
      { date: '2024-01-01', applications: 15, approvals: 12, fraudAlerts: 1 },
      { date: '2024-01-02', applications: 18, approvals: 14, fraudAlerts: 0 },
      { date: '2024-01-03', applications: 22, approvals: 17, fraudAlerts: 2 },
      { date: '2024-01-04', applications: 19, approvals: 15, fraudAlerts: 1 },
      { date: '2024-01-05', applications: 25, approvals: 20, fraudAlerts: 1 },
      { date: '2024-01-06', applications: 21, approvals: 16, fraudAlerts: 0 },
      { date: '2024-01-07', applications: 17, approvals: 13, fraudAlerts: 2 }
    ],
    documentStats: [
      { type: 'Income Proof', count: 156, averageProcessingTime: 2.3, fraudRate: 3.2 },
      { type: 'Bank Statement', count: 142, averageProcessingTime: 1.8, fraudRate: 2.1 },
      { type: 'ID Document', count: 89, averageProcessingTime: 1.2, fraudRate: 1.1 },
      { type: 'Tax Document', count: 67, averageProcessingTime: 3.1, fraudRate: 4.5 },
      { type: 'Property Doc', count: 34, averageProcessingTime: 4.2, fraudRate: 8.8 }
    ],
    stageDistribution: [
      { stage: 'Document Collection', count: 45, averageTime: 2.1 },
      { stage: 'Income Verification', count: 38, averageTime: 3.5 },
      { stage: 'Asset Verification', count: 29, averageTime: 2.8 },
      { stage: 'Property Appraisal', count: 22, averageTime: 7.2 },
      { stage: 'Final Underwriting', count: 18, averageTime: 4.1 },
      { stage: 'Approved', count: 95, averageTime: 0 }
    ],
    agentPerformance: [
      { agent: 'John Smith', applications: 42, avgProcessingTime: 11.2, approvalRate: 82.1, fraudCaught: 3 },
      { agent: 'Sarah Johnson', applications: 38, avgProcessingTime: 13.1, approvalRate: 76.3, fraudCaught: 2 },
      { agent: 'Michael Brown', applications: 51, avgProcessingTime: 10.8, approvalRate: 84.3, fraudCaught: 4 },
      { agent: 'Jessica Taylor', applications: 29, avgProcessingTime: 14.2, approvalRate: 72.4, fraudCaught: 1 }
    ]
  };

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setAnalyticsData(mockData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!analyticsData) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Smart Analytics Dashboard</h1>
        <p className="text-gray-600">
          AI-powered insights for mortgage application processing and risk management
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.overview.applicationsThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.averageProcessingTime} days</div>
                <p className="text-xs text-green-600">
                  <TrendingDown className="inline w-3 h-3 mr-1" />
                  -2.3 days from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(analyticsData.overview.approvalRate)}</div>
                <p className="text-xs text-green-600">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +3.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fraud Detection</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(analyticsData.overview.fraudDetectionRate)}</div>
                <p className="text-xs text-muted-foreground">
                  Documents flagged for review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2</div>
                <Progress value={94.2} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Processing Stages</CardTitle>
                <CardDescription>Current distribution across workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Applications",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.stageDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ stage, count }) => `${stage}: ${count}`}
                      >
                        {analyticsData.stageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Summary</CardTitle>
                <CardDescription>AI-powered risk indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Low Risk Applications</span>
                  <Badge>73%</Badge>
                </div>
                <Progress value={73} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medium Risk Applications</span>
                  <Badge variant="secondary">22%</Badge>
                </div>
                <Progress value={22} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">High Risk Applications</span>
                  <Badge variant="destructive">5%</Badge>
                </div>
                <Progress value={5} className="h-2" />

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <AlertTriangle className="inline w-4 h-4 mr-1" />
                    3 applications require immediate attention
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Trends</CardTitle>
              <CardDescription>Daily application volume and approval rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  applications: {
                    label: "Applications",
                    color: "hsl(var(--chart-1))",
                  },
                  approvals: {
                    label: "Approvals",
                    color: "hsl(var(--chart-2))",
                  },
                  fraudAlerts: {
                    label: "Fraud Alerts",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="applications" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="approvals" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="fraudAlerts" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Processing Analytics</CardTitle>
              <CardDescription>Performance metrics by document type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.documentStats.map((doc, index) => (
                  <div key={doc.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{doc.type}</h4>
                      <Badge variant="outline">{doc.count} processed</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Avg Processing Time</p>
                        <p className="font-medium">{doc.averageProcessingTime} min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fraud Rate</p>
                        <p className="font-medium text-red-600">{formatPercentage(doc.fraudRate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Success Rate</p>
                        <p className="font-medium text-green-600">{formatPercentage(100 - doc.fraudRate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Stage Analysis</CardTitle>
              <CardDescription>Time spent and bottlenecks in each stage</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Applications",
                    color: "hsl(var(--chart-1))",
                  },
                  averageTime: {
                    label: "Average Time (days)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.stageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#8884d8" />
                    <Bar dataKey="averageTime" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Dashboard</CardTitle>
              <CardDescription>Individual agent metrics and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.agentPerformance.map((agent, index) => (
                  <div key={agent.agent} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{agent.agent}</h4>
                      <Badge 
                        variant={
                          agent.approvalRate > 80 ? "default" :
                          agent.approvalRate > 75 ? "secondary" :
                          "destructive"
                        }
                      >
                        #{index + 1} Performance
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Applications</p>
                        <p className="font-medium text-lg">{agent.applications}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Processing</p>
                        <p className="font-medium text-lg">{agent.avgProcessingTime} days</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Approval Rate</p>
                        <p className="font-medium text-lg">{formatPercentage(agent.approvalRate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fraud Detected</p>
                        <p className="font-medium text-lg">{agent.fraudCaught}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartAnalyticsDashboard;
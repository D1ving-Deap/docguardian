import React from "react";
import ScrollReveal from "./ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Search, AlertCircle, FileCheck, Cloud, ShieldAlert, Users } from "lucide-react";

const mockBrokerData = [
  { 
    id: 1, 
    name: "Alex Johnson", 
    clients: 12, 
    verified: 8, 
    pending: 3, 
    flagged: 1,
  },
  { 
    id: 2, 
    name: "Sarah Williams", 
    clients: 9, 
    verified: 7, 
    pending: 2, 
    flagged: 0,
  },
  { 
    id: 3, 
    name: "Michael Brown", 
    clients: 15, 
    verified: 10, 
    pending: 3, 
    flagged: 2,
  },
  { 
    id: 4, 
    name: "Jessica Lee", 
    clients: 7, 
    verified: 5, 
    pending: 2, 
    flagged: 0,
  },
];

const clientProgressData = [
  { name: 'Document Upload', complete: 85, incomplete: 15 },
  { name: 'Verification', complete: 72, incomplete: 28 },
  { name: 'Fraud Check', complete: 90, incomplete: 10 },
  { name: 'Final Review', complete: 65, incomplete: 35 },
];

const chartConfig = {
  complete: {
    label: "Complete",
    color: "#10b981", // green-500
  },
  incomplete: {
    label: "Incomplete",
    color: "#f59e0b", // amber-500
  },
};

const WorkflowDashboard: React.FC = () => {
  return (
    <section id="workflow-dashboard" className="py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-background to-background/80">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Broker Workflow Management</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Track the entire mortgage application workflow, identify bottlenecks, detect fraud, and ensure compliance at every stage.
            </p>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:max-w-xl mx-auto mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="brokers">Brokers</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Verified</CardTitle>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">30</div>
                    <CardDescription>Applications verified</CardDescription>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Pending</CardTitle>
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">12</div>
                    <CardDescription>Applications in process</CardDescription>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Flagged</CardTitle>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">3</div>
                    <CardDescription>Potential issues detected</CardDescription>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Total</CardTitle>
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">45</div>
                    <CardDescription>Total applications</CardDescription>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Progress</CardTitle>
                    <CardDescription>Overall progress across all application stages</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={clientProgressData} barGap={8}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip 
                            content={<ChartTooltipContent />}
                          />
                          <Legend />
                          <Bar dataKey="complete" fill="#10b981" name="Complete" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="incomplete" fill="#f59e0b" name="Incomplete" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="brokers">
              <Card>
                <CardHeader>
                  <CardTitle>Broker Performance</CardTitle>
                  <CardDescription>Track broker activity and client document verification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Broker Name</TableHead>
                        <TableHead>Clients</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Flagged</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBrokerData.map((broker) => (
                        <TableRow key={broker.id}>
                          <TableCell className="font-medium">{broker.name}</TableCell>
                          <TableCell>{broker.clients}</TableCell>
                          <TableCell className="text-green-600">{broker.verified}</TableCell>
                          <TableCell className="text-amber-600">{broker.pending}</TableCell>
                          <TableCell className="text-red-600">{broker.flagged}</TableCell>
                          <TableCell>
                            {broker.flagged > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Review Needed
                              </span>
                            ) : broker.pending > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Clock className="h-3 w-3 mr-1" /> In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" /> Good Standing
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Document Processing</CardTitle>
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>ID Verification</span>
                        </div>
                        <span className="text-sm font-medium">98% accuracy</span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Income Proof</span>
                        </div>
                        <span className="text-sm font-medium">95% accuracy</span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Property Valuation</span>
                        </div>
                        <span className="text-sm font-medium">92% accuracy</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Credit History</span>
                        </div>
                        <span className="text-sm font-medium">97% accuracy</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Cloud Storage Access</CardTitle>
                      <Cloud className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 text-blue-500 mr-2" />
                          <span>Document Search</span>
                        </div>
                        <span className="text-sm font-medium">Real-time</span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-amber-500 mr-2" />
                          <span>Processing Time</span>
                        </div>
                        <span className="text-sm font-medium">&lt; 30 seconds</span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Multi-cloud Support</span>
                        </div>
                        <span className="text-sm font-medium">Enabled</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>API Integration</span>
                        </div>
                        <span className="text-sm font-medium">Available</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="fraud">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Fraud Detection</CardTitle>
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </div>
                  <CardDescription>Advanced fraud detection metrics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" /> Recent Alerts
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between items-center">
                            <span>Document Tampering</span>
                            <span className="font-mono">3 cases</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Identity Mismatch</span>
                            <span className="font-mono">2 cases</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Suspicious Metadata</span>
                            <span className="font-mono">5 cases</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" /> System Performance
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between items-center">
                            <span>False Positive Rate</span>
                            <span className="font-mono">0.3%</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Detection Accuracy</span>
                            <span className="font-mono">99.2%</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Processing Speed</span>
                            <span className="font-mono">1.2 sec/doc</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium mb-4">Top Fraud Indicators</h4>
                      <ul className="space-y-3">
                        <li>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Modified Documents</span>
                            <span className="text-sm font-medium">65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </li>
                        <li>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Identity Mismatch</span>
                            <span className="text-sm font-medium">45%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </li>
                        <li>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Inconsistent Data</span>
                            <span className="text-sm font-medium">32%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                          </div>
                        </li>
                        <li>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Suspicious Activity</span>
                            <span className="text-sm font-medium">28%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default WorkflowDashboard;


import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, FileCheck, CloudCheck, AlertTriangle, BarChart, 
  UserCheck, Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

const MortgageDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("brokers");

  // Sample broker data
  const brokers = [
    { 
      id: 1, 
      name: "John Smith", 
      activeClients: 5, 
      documentsPending: 2, 
      fraudAlerts: 0,
      performance: "High"
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      activeClients: 3, 
      documentsPending: 1, 
      fraudAlerts: 1,
      performance: "Medium"
    },
    { 
      id: 3, 
      name: "Michael Brown", 
      activeClients: 7, 
      documentsPending: 4, 
      fraudAlerts: 0,
      performance: "High"
    },
    { 
      id: 4, 
      name: "Jessica Taylor", 
      activeClients: 2, 
      documentsPending: 0, 
      fraudAlerts: 0,
      performance: "Medium"
    }
  ];

  // Sample client applications data
  const applications = [
    { 
      id: "APP-2023-001", 
      clientName: "Robert Davis", 
      broker: "John Smith",
      stage: "Document Verification",
      progress: 35, 
      status: "In Progress",
      lastUpdated: "2 hours ago"
    },
    { 
      id: "APP-2023-002", 
      clientName: "Emily Wilson", 
      broker: "Sarah Johnson",
      stage: "Income Verification",
      progress: 60, 
      status: "In Progress",
      lastUpdated: "4 hours ago"
    },
    { 
      id: "APP-2023-003", 
      clientName: "David Martinez", 
      broker: "Michael Brown",
      stage: "Property Appraisal",
      progress: 75, 
      status: "In Progress",
      lastUpdated: "1 day ago"
    },
    { 
      id: "APP-2023-004", 
      clientName: "Lisa Anderson", 
      broker: "John Smith",
      stage: "Final Approval",
      progress: 90, 
      status: "In Progress",
      lastUpdated: "3 hours ago"
    },
    { 
      id: "APP-2023-005", 
      clientName: "Mark Thompson", 
      broker: "Jessica Taylor",
      stage: "Document Verification",
      progress: 25, 
      status: "Pending",
      lastUpdated: "5 hours ago"
    }
  ];

  // Sample document processing data
  const documents = [
    { 
      id: "DOC-2023-001", 
      type: "Income Statement", 
      client: "Robert Davis",
      status: "Verified",
      fraudScore: "Low",
      processingTime: "2 min"
    },
    { 
      id: "DOC-2023-002", 
      type: "Property Title", 
      client: "Emily Wilson",
      status: "Pending Review",
      fraudScore: "Medium",
      processingTime: "5 min"
    },
    { 
      id: "DOC-2023-003", 
      type: "Bank Statement", 
      client: "David Martinez",
      status: "Verified",
      fraudScore: "Low",
      processingTime: "2 min"
    },
    { 
      id: "DOC-2023-004", 
      type: "Employment Letter", 
      client: "Lisa Anderson",
      status: "Alert",
      fraudScore: "High",
      processingTime: "10 min"
    }
  ];

  // Sample fraud alerts data
  const fraudAlerts = [
    { 
      id: "ALERT-001", 
      clientName: "Emily Wilson", 
      documentType: "Property Title",
      issue: "Metadata inconsistencies",
      severity: "Medium",
      detectedAt: "2023-03-15 09:45 AM" 
    },
    { 
      id: "ALERT-002", 
      clientName: "Lisa Anderson", 
      documentType: "Employment Letter",
      issue: "Digital forgery detected",
      severity: "High",
      detectedAt: "2023-03-14 14:30 PM" 
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Verified":
        return <Badge className="bg-green-500">Verified</Badge>;
      case "Pending Review":
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case "Alert":
        return <Badge className="bg-red-500">Alert</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="brokers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Brokers</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span>Applications</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <CloudCheck className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Fraud Alerts</span>
          </TabsTrigger>
        </TabsList>

        {/* Broker Performance Dashboard */}
        <TabsContent value="brokers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Broker Performance Dashboard
              </CardTitle>
              <CardDescription>
                Monitor broker activity and performance metrics across all applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Broker</TableHead>
                    <TableHead>Active Clients</TableHead>
                    <TableHead>Documents Pending</TableHead>
                    <TableHead>Fraud Alerts</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokers.map((broker) => (
                    <TableRow key={broker.id}>
                      <TableCell className="font-medium">{broker.name}</TableCell>
                      <TableCell>{broker.activeClients}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {broker.documentsPending}
                          {broker.documentsPending > 3 && <Clock className="w-4 h-4 text-orange-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {broker.fraudAlerts}
                          {broker.fraudAlerts > 0 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={broker.performance === "High" ? "bg-green-500" : "bg-yellow-500"}>
                          {broker.performance}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Applications Dashboard */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Client Application Status
              </CardTitle>
              <CardDescription>
                Track the progress of all mortgage applications in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>{app.clientName}</TableCell>
                      <TableCell>{app.broker}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{app.stage}</span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${app.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{app.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Processing Dashboard */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudCheck className="w-5 h-5" />
                Document Processing Status
              </CardTitle>
              <CardDescription>
                View all documents in the cloud and their verification status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fraud Risk</TableHead>
                    <TableHead>Processing Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.id}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{doc.client}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {doc.fraudScore === "Low" && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {doc.fraudScore === "Medium" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                          {doc.fraudScore === "High" && <XCircle className="w-4 h-4 text-red-500" />}
                          <span>{doc.fraudScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.processingTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Alerts Dashboard */}
        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Fraud Detection Alerts
              </CardTitle>
              <CardDescription>
                Review potential fraudulent activities detected in documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fraudAlerts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Detected At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fraudAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.id}</TableCell>
                        <TableCell>{alert.clientName}</TableCell>
                        <TableCell>{alert.documentType}</TableCell>
                        <TableCell>{alert.issue}</TableCell>
                        <TableCell>
                          <Badge className={
                            alert.severity === "High" ? "bg-red-500" : 
                            alert.severity === "Medium" ? "bg-yellow-500" : "bg-green-500"
                          }>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.detectedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium">No fraud alerts detected</p>
                  <p className="text-muted-foreground">All documents are currently passing verification checks.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MortgageDashboard;

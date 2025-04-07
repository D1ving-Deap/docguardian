
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";

interface Application {
  id: string;
  client_name: string;
  stage: string;
  progress: number;
  status: string;
  fraud_score: string | null;
  created_at: string;
}

const ApplicationList = () => {
  // Mock data until the Supabase schema is properly set up
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "app-001",
      client_name: "John Smith",
      stage: "Document Verification",
      progress: 35,
      status: "Pending",
      fraud_score: "Low",
      created_at: new Date().toISOString(),
    },
    {
      id: "app-002",
      client_name: "Emily Johnson",
      stage: "Income Verification",
      progress: 65,
      status: "Pending",
      fraud_score: "Low",
      created_at: new Date().toISOString(),
    },
    {
      id: "app-003",
      client_name: "Robert Davis",
      stage: "Property Appraisal",
      progress: 80,
      status: "Approved",
      fraud_score: null,
      created_at: new Date().toISOString(),
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mortgage Applications</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      {isLoading ? (
        <div>Loading applications...</div>
      ) : applications && applications.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{app.client_name}</CardTitle>
                  <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Stage: {app.stage}</div>
                    <Progress value={app.progress} className="h-2" />
                    <div className="text-xs text-right mt-1">{app.progress}% Complete</div>
                  </div>
                  
                  {app.fraud_score && (
                    <div className="text-sm">
                      <span className="font-medium">Fraud Score:</span> {app.fraud_score}
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Created on {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2">
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No applications yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first mortgage application to get started
            </p>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationList;

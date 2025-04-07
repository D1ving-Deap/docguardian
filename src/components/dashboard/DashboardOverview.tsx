
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const DashboardOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // In a real app, we'd fetch these stats from the database
      // For now, we'll use mock data
      return {
        totalApplications: 24,
        pendingVerification: 8,
        completedVerifications: 16,
        fraudAlerts: 3,
        averageProcessingTime: "2.4 min",
      };
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : stats?.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Mortgage applications in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : stats?.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">Applications awaiting verification</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Documents</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : stats?.completedVerifications}</div>
            <p className="text-xs text-muted-foreground">Successfully verified documents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : stats?.fraudAlerts}</div>
            <p className="text-xs text-muted-foreground">Potential fraud cases detected</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Verification Activity</CardTitle>
            <CardDescription>
              Document verification activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Charts will be implemented here using Recharts
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Processing Times</CardTitle>
            <CardDescription>
              Average document verification time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-3xl font-bold">{isLoading ? "-" : stats?.averageProcessingTime}</div>
              <p className="text-sm text-muted-foreground">Average processing time</p>
              <div className="w-full h-4 bg-gray-100 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: "70%" }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground w-full flex justify-between pt-1">
                <span>0s</span>
                <span>10s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;

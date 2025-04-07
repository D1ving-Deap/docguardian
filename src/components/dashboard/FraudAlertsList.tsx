
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface FraudAlert {
  id: string;
  document_id: string;
  issue: string;
  severity: string;
  created_at: string;
  document?: {
    document_type: string;
    application?: {
      client_name: string;
    }
  }
}

const FraudAlertsList = () => {
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          document:document_id (
            document_type,
            application:application_id (
              client_name
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FraudAlert[];
    },
  });

  if (isLoading) return <div>Loading alerts...</div>;
  if (error) return <div>Error loading alerts</div>;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Fraud Alerts</h2>

      {alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    {alert.document?.application?.client_name || "Unknown Client"}
                  </CardTitle>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity} Severity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Document Type:</span> {alert.document?.document_type || "Unknown"}
                  </div>
                  <div>
                    <span className="font-medium">Issue:</span> {alert.issue}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Detected on {new Date(alert.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No fraud alerts detected</h3>
            <p className="text-muted-foreground text-sm mt-1">
              All documents have passed verification
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FraudAlertsList;

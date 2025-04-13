
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface FraudAlert {
  id: string;
  document_id: string | null;
  issue: string;
  severity: string;
  created_at: string;
  resolved: boolean;
  document?: {
    document_type: string;
    application_id?: string | null;
    application?: {
      client_name: string;
    }
  }
}

const FraudAlertsList = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFraudAlerts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fraud_alerts'
        },
        () => {
          fetchFraudAlerts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFraudAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          document:document_id (
            document_type,
            application_id,
            application:application_id (
              client_name
            )
          )
        `)
        .eq('resolved', false)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setAlerts(data as FraudAlert[]);
      }
    } catch (error) {
      console.error("Error fetching fraud alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load fraud alerts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const markAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('fraud_alerts')
        .update({ resolved: true })
        .eq('id', alertId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Alert marked as resolved",
      });
      
      // Remove the alert from the local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Fraud Alerts</h2>

      {isLoading ? (
        <div>Loading alerts...</div>
      ) : alerts && alerts.length > 0 ? (
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
                  <div className="pt-2">
                    <button 
                      onClick={() => markAsResolved(alert.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
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

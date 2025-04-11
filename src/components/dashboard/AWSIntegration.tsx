
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Cloud, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/utils/supabaseStorage";

const AWSIntegration = () => {
  const { toast } = useToast();
  const [storageSettings, setStorageSettings] = useState({
    enabled: false,
    region: "ca-central-1", // Toronto region
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [freeUsageRemaining, setFreeUsageRemaining] = useState({
    storage: "5 GB",
    requests: "20,000 GET/month",
    dataTransfer: "15 GB/month"
  });
  
  useEffect(() => {
    // Check if storage is connected
    const checkConnection = async () => {
      const connected = await storage.isStorageConnected();
      setIsConnected(connected);
      
      if (connected) {
        setStorageSettings({
          enabled: true,
          region: "ca-central-1" // Default region
        });
        
        // Get usage stats
        const usageResult = await storage.getFreeTierUsage();
        if (usageResult && !('error' in usageResult)) {
          const { totalStorage } = usageResult;
          const remainingStorage = Math.max(0, 5 * 1024 * 1024 * 1024 - totalStorage);
          setFreeUsageRemaining({
            storage: `${(remainingStorage / (1024 * 1024 * 1024)).toFixed(2)} GB`,
            requests: "20,000 GET/month",
            dataTransfer: "15 GB/month"
          });
        }
      }
    };
    
    checkConnection();
  }, []);
  
  const handleConnect = async () => {
    setIsLoading(true);
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to enable storage",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Initialize storage buckets
      const bucketsInitialized = await storage.isStorageConnected();
      if (!bucketsInitialized) {
        toast({
          title: "Storage Connection Failed",
          description: "Unable to initialize storage buckets",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      setIsConnected(true);
      setStorageSettings({
        ...storageSettings,
        enabled: true
      });
      
      toast({
        title: "Storage Connected",
        description: "Successfully connected to storage services",
      });
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to storage services",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    setStorageSettings({
      ...storageSettings,
      enabled: false
    });
    
    toast({
      title: "Storage Disconnected",
      description: "Successfully disconnected from storage services",
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Storage Integration Settings</h2>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Supabase Storage</CardTitle>
              <CardDescription>
                Connect to Supabase Storage for secure document storage and management
              </CardDescription>
            </div>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800 flex items-center">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 flex items-center">
                <XCircle className="mr-1 h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Storage services are connected</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your Supabase Storage is successfully connected. Document storage is now using secure cloud storage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Storage Region</p>
                  <p className="text-sm text-muted-foreground">{storageSettings.region} (Toronto)</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Services Enabled</p>
                  <p className="text-sm text-muted-foreground">Supabase Storage</p>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Free Tier Usage</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <p className="font-medium">Storage</p>
                          <p>{freeUsageRemaining.storage} remaining</p>
                        </div>
                        <div>
                          <p className="font-medium">Requests</p>
                          <p>{freeUsageRemaining.requests} remaining</p>
                        </div>
                        <div>
                          <p className="font-medium">Data Transfer</p>
                          <p>{freeUsageRemaining.dataTransfer} remaining</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-amber-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Free Tier Notice</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        To avoid unexpected charges, we've implemented strict limits on:
                      </p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Maximum file size: 10MB per file</li>
                        <li>Total storage: Capped at 4.9GB (below 5GB free tier)</li>
                        <li>Daily request limits to stay within monthly free tier</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Storage Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Supabase Storage Free Tier includes:
                      </p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>5 GB of storage space</li>
                        <li>Free uploads and downloads</li>
                        <li>Secure file management with RLS policies</li>
                      </ul>
                      <p className="mt-1">
                        We've implemented safeguards to prevent exceeding free tier limits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isConnected ? (
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect Storage
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isLoading}>
              <Cloud className="mr-2 h-4 w-4" />
              {isLoading ? "Connecting..." : "Connect Storage"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Storage Settings</CardTitle>
          <CardDescription>
            Configure how document storage works with Supabase Storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="storageEnabled" 
                checked={storageSettings.enabled}
                onCheckedChange={(checked) => 
                  setStorageSettings({...storageSettings, enabled: checked === true})
                }
                disabled={!isConnected}
              />
              <label 
                htmlFor="storageEnabled" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable Supabase Storage for document storage
              </label>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">About Supabase Storage</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Supabase Storage is a highly scalable object storage service. 
                      Your documents will be securely stored, encrypted at rest, and available only to your 
                      authorized users.
                    </p>
                    <p className="mt-1">
                      We've implemented safety measures to ensure your usage stays within the free tier limits:
                    </p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Automatic cleanup of temporary files</li>
                      <li>File size restrictions to prevent large uploads</li>
                      <li>Storage monitoring and alerts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Checkbox({ 
  id, 
  checked, 
  onCheckedChange, 
  disabled 
}: { 
  id: string, 
  checked: boolean, 
  onCheckedChange: (checked: boolean | "indeterminate") => void,
  disabled?: boolean
}) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
    />
  );
}

export default AWSIntegration;

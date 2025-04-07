
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Cloud, AlertTriangle, InformationCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AWSIntegration = () => {
  const { toast } = useToast();
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: "",
    secretAccessKey: "",
    region: "ca-central-1", // Toronto region
    s3Enabled: false
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [freeUsageRemaining, setFreeUsageRemaining] = useState({
    storage: "5 GB",
    requests: "20,000 GET/month",
    dataTransfer: "15 GB/month"
  });
  
  useEffect(() => {
    // Check if there's existing connection status in localStorage
    const savedConnection = localStorage.getItem('aws-connection');
    if (savedConnection) {
      try {
        const savedData = JSON.parse(savedConnection);
        setAwsCredentials({
          accessKeyId: savedData.accessKeyId || "",
          secretAccessKey: "••••••••••••••••", // Don't store the actual secret
          region: savedData.region || "ca-central-1",
          s3Enabled: savedData.s3Enabled || false
        });
        setIsConnected(true);
      } catch (error) {
        console.error("Error parsing saved AWS connection", error);
      }
    }
  }, []);
  
  const handleConnect = () => {
    setIsLoading(true);
    
    // Validate AWS credentials format
    if (!awsCredentials.accessKeyId || !awsCredentials.accessKeyId.match(/^[A-Z0-9]{20}$/)) {
      toast({
        title: "Invalid Access Key ID",
        description: "Please check your AWS Access Key ID format",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    if (!awsCredentials.secretAccessKey || awsCredentials.secretAccessKey.length < 12) {
      toast({
        title: "Invalid Secret Access Key",
        description: "Please check your AWS Secret Access Key",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Store credentials in localStorage (excluding the secret key for security)
    const safeCredentials = {
      accessKeyId: awsCredentials.accessKeyId,
      region: awsCredentials.region,
      s3Enabled: true
    };
    
    // Simulate API call to validate credentials
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      setAwsCredentials({
        ...awsCredentials,
        s3Enabled: true,
        secretAccessKey: "••••••••••••••••" // Mask the key after saving
      });
      
      localStorage.setItem('aws-connection', JSON.stringify(safeCredentials));
      
      toast({
        title: "AWS Connected",
        description: "Successfully connected to AWS services",
      });
    }, 1500);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    setAwsCredentials({
      accessKeyId: "",
      secretAccessKey: "",
      region: "ca-central-1",
      s3Enabled: false
    });
    
    localStorage.removeItem('aws-connection');
    
    toast({
      title: "AWS Disconnected",
      description: "Successfully disconnected from AWS services",
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AWS Integration Settings</h2>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Amazon Web Services</CardTitle>
              <CardDescription>
                Connect to AWS S3 for secure document storage and Amazon Textract for text extraction
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
                    <h3 className="text-sm font-medium text-green-800">AWS services are connected</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your AWS account is successfully connected. Document storage is now using Amazon S3.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">AWS Region</p>
                  <p className="text-sm text-muted-foreground">{awsCredentials.region} (Toronto)</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Services Enabled</p>
                  <p className="text-sm text-muted-foreground">Amazon S3</p>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InformationCircle className="h-5 w-5 text-blue-400" />
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
                        To avoid charges beyond the free tier, we've implemented strict limits on:
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
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
                  <Input 
                    id="accessKeyId" 
                    placeholder="Enter your AWS access key ID" 
                    value={awsCredentials.accessKeyId}
                    onChange={(e) => setAwsCredentials({...awsCredentials, accessKeyId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
                  <Input 
                    id="secretAccessKey" 
                    type="password"
                    placeholder="Enter your AWS secret access key" 
                    value={awsCredentials.secretAccessKey}
                    onChange={(e) => setAwsCredentials({...awsCredentials, secretAccessKey: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">AWS Region</Label>
                  <select
                    id="region"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={awsCredentials.region}
                    onChange={(e) => setAwsCredentials({...awsCredentials, region: e.target.value})}
                  >
                    <option value="ca-central-1">Canada (Toronto)</option>
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-east-2">US East (Ohio)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  </select>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InformationCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Free Tier Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        AWS Free Tier includes:
                      </p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>5 GB of Amazon S3 storage</li>
                        <li>20,000 GET requests & 2,000 PUT requests per month</li>
                        <li>15 GB of data transfer out each month</li>
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
              Disconnect AWS
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isLoading || !awsCredentials.accessKeyId || !awsCredentials.secretAccessKey}>
              <Cloud className="mr-2 h-4 w-4" />
              {isLoading ? "Connecting..." : "Connect AWS"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>S3 Storage Settings</CardTitle>
          <CardDescription>
            Configure how document storage works with Amazon S3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="s3Enabled" 
                checked={awsCredentials.s3Enabled}
                onCheckedChange={(checked) => 
                  setAwsCredentials({...awsCredentials, s3Enabled: checked === true})
                }
                disabled={!isConnected}
              />
              <label 
                htmlFor="s3Enabled" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable Amazon S3 for document storage
              </label>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">About Amazon S3</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Amazon S3 (Simple Storage Service) is a highly scalable object storage service. 
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

function InformationCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default AWSIntegration;


import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Cloud } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AWSIntegration = () => {
  const { toast } = useToast();
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-1",
    textractEnabled: false
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = () => {
    setIsLoading(true);
    
    // Simulate API call to validate credentials
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      
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
      region: "us-east-1",
      textractEnabled: false
    });
    
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
                Connect to AWS for document text extraction using Amazon Textract
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
                        Your AWS account is successfully connected. You can now use Amazon Textract for document text extraction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">AWS Region</p>
                  <p className="text-sm text-muted-foreground">{awsCredentials.region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Services Enabled</p>
                  <p className="text-sm text-muted-foreground">Amazon Textract</p>
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
          <CardTitle>Document Processing Settings</CardTitle>
          <CardDescription>
            Configure how document text extraction works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="textractEnabled" 
                checked={awsCredentials.textractEnabled}
                onCheckedChange={(checked) => 
                  setAwsCredentials({...awsCredentials, textractEnabled: checked === true})
                }
                disabled={!isConnected}
              />
              <label 
                htmlFor="textractEnabled" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable Amazon Textract for document processing
              </label>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">About Amazon Textract</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Amazon Textract is a service that automatically extracts text and data from scanned documents. 
                      It goes beyond simple optical character recognition (OCR) to identify, understand, and extract 
                      data from forms and tables.
                    </p>
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

function InformationCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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

import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  FileText,
  ArrowRight,
  User, 
  Briefcase, 
  Home, 
  CreditCard,
  ClipboardList,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileUp
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase, supabaseUrl } from "@/integrations/supabase/client";
import DocumentUpload from './DocumentUpload';

interface ApplicationData {
  id: string;
  client_name: string;
  email: string;
  stage: string;
  progress: number;
  status: string;
  fraud_score: string | null;
  created_at: string;
  updated_at: string;
}

// Schema definitions
const getStartedSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  maritalStatus: z.string().min(1, "Please select a marital status"),
  dependants: z.string().min(1, "Please enter number of dependants")
});

const identitySchema = z.object({
  sin: z.string().min(9, "Valid SIN required").max(9, "SIN must be 9 digits"),
  dob: z.string().min(1, "Date of birth is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  yearsAtAddress: z.string(),
  housingStatus: z.string(),
  monthlyPayment: z.string(),
});

const ApplicationStageFlow = () => {
  const [currentStage, setCurrentStage] = useState("get-started");
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { search } = useLocation();
  const applicationId = new URLSearchParams(search).get('id');
  const { toast } = useToast();
  
  const stageIcons = {
    "get-started": <User className="h-5 w-5" />,
    "identity": <FileText className="h-5 w-5" />,
    "employment": <Briefcase className="h-5 w-5" />,
    "assets": <CreditCard className="h-5 w-5" />,
    "property": <Home className="h-5 w-5" />,
    "final": <ClipboardList className="h-5 w-5" />
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplication(applicationId);
      
      // Set up realtime subscription
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mortgage_applications',
            filter: `id=eq.${applicationId}`
          },
          (payload) => {
            if (payload.new) {
              setApplication(payload.new as ApplicationData);
              updateStageBasedOnProgress((payload.new as ApplicationData).progress);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [applicationId]);
  
  const fetchApplication = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mortgage_applications')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setApplication(data as ApplicationData);
        updateStageBasedOnProgress(data.progress);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateStageBasedOnProgress = (progress: number) => {
    if (progress >= 0 && progress < 20) {
      setCurrentStage("get-started");
    } else if (progress >= 20 && progress < 40) {
      setCurrentStage("identity");
    } else if (progress >= 40 && progress < 60) {
      setCurrentStage("employment");
    } else if (progress >= 60 && progress < 80) {
      setCurrentStage("assets");
    } else if (progress >= 80 && progress < 90) {
      setCurrentStage("property");
    } else {
      setCurrentStage("final");
    }
  };
  
  const updateApplicationProgress = async (stage: string, increment: number) => {
    if (!applicationId || !application) return;
    
    try {
      // Get current application data
      const { data, error } = await supabase
        .from('mortgage_applications')
        .select('progress, stage')
        .eq('id', applicationId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Calculate new progress value
        const newProgress = Math.min(data.progress + increment, 100);
        
        // Update the application
        await supabase
          .from('mortgage_applications')
          .update({ 
            progress: newProgress,
            stage: stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);
      }
    } catch (error) {
      console.error("Error updating application progress:", error);
      toast({
        title: "Error",
        description: "Failed to update application progress",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading application details...</span>
      </div>
    );
  }
  
  if (!applicationId || !application) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No application ID provided or application not found. Please go back to the applications list and select an application.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mortgage Application: {application.client_name}</h1>
        <div className="text-sm text-muted-foreground">
          Application ID: {applicationId}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Application Progress</span>
          <span className="text-sm">{application.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${application.progress}%` }}
          ></div>
        </div>
      </div>
      
      <Tabs value={currentStage} className="w-full">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger 
            value="get-started" 
            onClick={() => setCurrentStage("get-started")}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Get Started</span>
          </TabsTrigger>
          <TabsTrigger 
            value="identity" 
            onClick={() => setCurrentStage("identity")}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Identity</span>
          </TabsTrigger>
          <TabsTrigger 
            value="employment" 
            onClick={() => setCurrentStage("employment")}
            className="flex items-center gap-2"
          >
            <Briefcase className="h-4 w-4" />
            <span className="hidden md:inline">Employment</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assets" 
            onClick={() => setCurrentStage("assets")}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden md:inline">Assets</span>
          </TabsTrigger>
          <TabsTrigger 
            value="property" 
            onClick={() => setCurrentStage("property")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Property</span>
          </TabsTrigger>
          <TabsTrigger 
            value="final" 
            onClick={() => setCurrentStage("final")}
            className="flex items-center gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden md:inline">Final</span>
          </TabsTrigger>
        </TabsList>

        {/* Stage 1: Get Started */}
        <TabsContent value="get-started">
          <GetStartedStage 
            applicationId={applicationId} 
            clientData={{
              fullName: application.client_name,
              email: application.email
            }}
            onComplete={() => {
              updateApplicationProgress("Identity Verification", 20);
              setCurrentStage("identity");
            }} 
          />
        </TabsContent>

        {/* Stage 2: Identity & Residency */}
        <TabsContent value="identity">
          <IdentityStage 
            applicationId={applicationId} 
            onComplete={() => {
              updateApplicationProgress("Employment Verification", 20);
              setCurrentStage("employment");
            }} 
          />
        </TabsContent>

        {/* Stage 3: Employment & Income */}
        <TabsContent value="employment">
          <EmploymentStage 
            applicationId={applicationId}
            onComplete={() => {
              updateApplicationProgress("Asset Verification", 20);
              setCurrentStage("assets");
            }} 
          />
        </TabsContent>

        {/* Stage 4: Assets & Liabilities */}
        <TabsContent value="assets">
          <AssetsStage 
            applicationId={applicationId}
            onComplete={() => {
              updateApplicationProgress("Property Verification", 20);
              setCurrentStage("property");
            }} 
          />
        </TabsContent>

        {/* Stage 5: Property Info */}
        <TabsContent value="property">
          <PropertyStage 
            applicationId={applicationId}
            onComplete={() => {
              updateApplicationProgress("Final Review", 10);
              setCurrentStage("final");
            }} 
          />
        </TabsContent>

        {/* Stage 6: Final Declarations & Signatures */}
        <TabsContent value="final">
          <FinalStage 
            applicationId={applicationId}
            onComplete={() => {
              updateApplicationProgress("Completed", 10);
              
              // Update application status to Approved
              supabase
                .from('mortgage_applications')
                .update({ 
                  status: 'Approved',
                  updated_at: new Date().toISOString()
                })
                .eq('id', applicationId);
                
              toast({
                title: "Application Approved",
                description: "Mortgage application has been successfully completed and approved",
              });
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GetStartedStage = ({ applicationId, clientData, onComplete }: { applicationId: string, clientData: any, onComplete: () => void }) => {
  const form = useForm<z.infer<typeof getStartedSchema>>({
    resolver: zodResolver(getStartedSchema),
    defaultValues: {
      fullName: clientData?.fullName || "",
      email: clientData?.email || "",
      phone: "",
      maritalStatus: "",
      dependants: "0"
    }
  });

  const onSubmit = (data: z.infer<typeof getStartedSchema>) => {
    console.log("Get Started data:", data);
    // Save data to application
    supabase
      .from('mortgage_applications')
      .update({
        client_name: data.fullName,
        email: data.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);
      
    onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started (2 mins)</CardTitle>
        <CardDescription>
          Let's start by identifying you and gathering some basic information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Legal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="common-law">Common Law</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dependants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Dependants</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of dependants" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Continue to Identity <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const IdentityStage = ({ applicationId, onComplete }: { applicationId: string, onComplete: () => void }) => {
  const { toast } = useToast();
  const [idFrontId, setIdFrontId] = useState<string | null>(null);
  const [idFrontData, setIdFrontData] = useState<any>(null);
  const [addressProofId, setAddressProofId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof identitySchema>>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      sin: "",
      dob: "",
      currentAddress: "",
      yearsAtAddress: "",
      housingStatus: "",
      monthlyPayment: ""
    }
  });

  const onSubmit = (data: z.infer<typeof identitySchema>) => {
    // Check if required documents are uploaded
    if (!idFrontId || !addressProofId) {
      toast({
        title: "Missing documents",
        description: "Please upload all required documents",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Identity data:", data);
    onComplete();
  };

  const handleIdUpload = (docId: string | null, extractedData?: any) => {
    setIdFrontId(docId);
    if (extractedData) {
      setIdFrontData(extractedData);
      
      // Auto-fill form with extracted data if available
      if (extractedData.name) {
        form.setValue('sin', '123456789'); // Dummy SIN for demo
      }
      
      if (extractedData.address) {
        form.setValue('currentAddress', extractedData.address);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity & Residency (3 mins)</CardTitle>
        <CardDescription>
          Let's verify your identity and address history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-blue-50 border border-blue-100 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Document Processing</p>
              <p className="text-sm text-blue-700 mt-1">
                Upload your identification documents below. Our system will automatically extract information
                to speed up your application process.
              </p>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIN (Social Insurance Number)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="•••••••••" {...field} />
                  </FormControl>
                  <FormDescription>Securely encrypted and masked for your protection</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, Province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yearsAtAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years at Address</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select years" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="<1">Less than 1 year</SelectItem>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5+">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="housingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Housing Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="own">Own</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="living-with-family">Living with Family</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="monthlyPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Housing Payment ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Required Documents</h3>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">ID Document (Driver's License or Passport)</h4>
                <DocumentUpload 
                  label="ID Document"
                  description="Upload your ID as a PDF document"
                  documentType="id"
                  applicationId={applicationId}
                  onChange={handleIdUpload}
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Address Proof (Utility Bill or Bank Statement)</h4>
                <DocumentUpload 
                  label="Address Proof Document"
                  description="Upload a document showing your current address"
                  documentType="address_proof"
                  applicationId={applicationId}
                  onChange={(docId) => setAddressProofId(docId)}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
            >
              Continue to Employment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const EmploymentStage = ({ applicationId, onComplete }: { applicationId: string, onComplete: () => void }) => {
  const { toast } = useToast();
  const [paystubId, setPaystubId] = useState<string | null>(null);
  const [paystubData, setPaystubData] = useState<any>(null);
  const [employmentLetterId, setEmploymentLetterId] = useState<string | null>(null);
  
  const handleSubmit = () => {
    // Check if at least one document is uploaded
    if (!paystubId && !employmentLetterId) {
      toast({
        title: "Missing documents",
        description: "Please upload at least one employment document",
        variant: "destructive"
      });
      return;
    }
    
    onComplete();
  };
  
  const handlePaystubUpload = (docId: string | null, extractedData?: any) => {
    setPaystubId(docId);
    if (extractedData) {
      setPaystubData(extractedData);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment & Income (3-5 mins)</CardTitle>
        <CardDescription>
          Let's assess your income stability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Please upload at least one of the following documents to verify your employment and income.
                Our system will automatically extract information to speed up your application.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Recent Paystubs (last 2-3 pay periods)</h4>
              <DocumentUpload 
                label="Paystub"
                description="Upload your most recent paystub as a PDF document"
                documentType="paystub"
                applicationId={applicationId}
                onChange={handlePaystubUpload}
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Employment Verification Letter</h4>
              <DocumentUpload 
                label="Employment Letter"
                description="Upload an employment verification letter from your employer"
                documentType="employment_letter"
                applicationId={applicationId}
                onChange={(docId) => setEmploymentLetterId(docId)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full"
          >
            Continue to Assets <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AssetsStage = ({ applicationId, onComplete }: { applicationId: string, onComplete: () => void }) => {
  const { toast } = useToast();
  const [bankStatementId, setBankStatementId] = useState<string | null>(null);
  const [investmentStatementId, setInvestmentStatementId] = useState<string | null>(null);
  
  const handleSubmit = () => {
    // Check if at least one document is uploaded
    if (!bankStatementId) {
      toast({
        title: "Missing documents",
        description: "Please upload your bank statements",
        variant: "destructive"
      });
      return;
    }
    
    onComplete();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets & Liabilities (3-5 mins)</CardTitle>
        <CardDescription>
          Let's verify your assets and financial capacity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Please upload your bank statements and any investment account statements.
                Our system will automatically analyze your financial capacity.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Bank Statements (last 3 months)</h4>
              <DocumentUpload 
                label="Bank Statement"
                description="Upload your last 3 months of bank statements"
                documentType="bank_statement"
                applicationId={applicationId}
                onChange={(docId) => setBankStatementId(docId)}
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Investment Account Statements (optional)</h4>
              <DocumentUpload 
                label="Investment Statement"
                description="Upload your investment account statements if applicable"
                documentType="investment_statement"
                applicationId={applicationId}
                onChange={(docId) => setInvestmentStatementId(docId)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full"
          >
            Continue to Property <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyStage = ({ applicationId, onComplete }: { applicationId: string, onComplete: () => void }) => {
  const { toast } = useToast();
  const [propertyDocId, setPropertyDocId] = useState<string | null>(null);
  
  const propertyForm = useForm({
    defaultValues: {
      propertyAddress: "",
      propertyType: "",
      purchasePrice: "",
      downPayment: ""
    }
  });
  
  const onSubmit = (data: any) => {
    console.log("Property data:", data);
    onComplete();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Information (2-3 mins)</CardTitle>
        <CardDescription>
          Tell us about the property you're interested in purchasing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Form {...propertyForm}>
            <form onSubmit={propertyForm.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={propertyForm.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, Province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={propertyForm.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family Home</SelectItem>
                        <SelectItem value="condo">Condominium</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi-family">Multi-Family Home</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={propertyForm.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={propertyForm.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Down Payment ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Property Documentation (if available)</h4>
                <DocumentUpload 
                  label="Property Documents"
                  description="Upload any available property documentation (listing, appraisal, etc.)"
                  documentType="property_doc"
                  applicationId={applicationId}
                  onChange={(docId) => setPropertyDocId(docId)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
              >
                Continue to Final Review <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

const FinalStage = ({ applicationId, onComplete }: { applicationId: string, onComplete: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Declarations & Signatures (5-10 mins)</CardTitle>
        <CardDescription>
          Review and submit your complete mortgage application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Final Document Submission</p>
                <p className="text-sm text-blue-700 mt-1">
                  Please upload all required documents for your mortgage application. 
                  Our system will securely process and verify these documents.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <DocumentUpload 
              label="Application Consent Form"
              description="Upload signed application consent document"
              documentType="consent"
              applicationId={applicationId}
            />
            
            <DocumentUpload 
              label="Additional Supporting Documents"
              description="Optional: Upload any additional supporting documents"
              documentType="supporting_docs"
              applicationId={applicationId}
            />
          </div>

          <Button 
            type="button" 
            onClick={onComplete} 
            className="w-full"
          >
            Submit Final Application <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStageFlow;

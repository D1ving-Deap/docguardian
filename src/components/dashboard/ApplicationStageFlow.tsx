
import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
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
  AlertTriangle 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { s3 } from "@/utils/awsStorage";

const ApplicationStageFlow = () => {
  const [currentStage, setCurrentStage] = useState("get-started");
  
  const stageIcons = {
    "get-started": <User className="h-5 w-5" />,
    "identity": <FileText className="h-5 w-5" />,
    "employment": <Briefcase className="h-5 w-5" />,
    "assets": <CreditCard className="h-5 w-5" />,
    "property": <Home className="h-5 w-5" />,
    "final": <ClipboardList className="h-5 w-5" />
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Mortgage Application</h1>
      
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
          <GetStartedStage onComplete={() => setCurrentStage("identity")} />
        </TabsContent>

        {/* Stage 2: Identity & Residency */}
        <TabsContent value="identity">
          <IdentityStage onComplete={() => setCurrentStage("employment")} />
        </TabsContent>

        {/* Stage 3: Employment & Income */}
        <TabsContent value="employment">
          <EmploymentStage onComplete={() => setCurrentStage("assets")} />
        </TabsContent>

        {/* Stage 4: Assets & Liabilities */}
        <TabsContent value="assets">
          <AssetsStage onComplete={() => setCurrentStage("property")} />
        </TabsContent>

        {/* Stage 5: Property Info */}
        <TabsContent value="property">
          <PropertyStage onComplete={() => setCurrentStage("final")} />
        </TabsContent>

        {/* Stage 6: Final Declarations & Signatures */}
        <TabsContent value="final">
          <FinalStage onComplete={() => console.log("Application completed")} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// File Upload Component
interface FileUploadProps {
  label: string;
  description?: string;
  acceptTypes?: string;
  bucket?: string;
  folder?: string;
  onChange?: (fileKey: string | null) => void;
}

const FileUpload = ({ 
  label, 
  description, 
  acceptTypes = "image/*, application/pdf", 
  bucket = "user-documents",
  folder = "",
  onChange 
}: FileUploadProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewUrl(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // For PDFs, show an icon instead
        setPreviewUrl(null);
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    // Check if AWS is connected
    if (!s3.isAWSConnected()) {
      toast({
        title: "AWS not connected",
        description: "Please connect to AWS in settings first",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }
    
    // Generate key with folder path
    const key = folder ? `${folder}/${file.name}` : file.name;
    
    // Upload to S3
    const result = await s3.uploadFile(file, bucket, key);
    
    if ('error' in result) {
      toast({
        title: "Upload failed",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Upload successful",
        description: "File uploaded successfully"
      });
      
      setUploadedKey(result.key);
      if (onChange) onChange(result.key);
    }
    
    setIsUploading(false);
  };
  
  const handleRemove = async () => {
    if (uploadedKey) {
      // Delete from S3
      const result = await s3.deleteFile(uploadedKey, bucket);
      
      if ('error' in result) {
        toast({
          title: "Removal failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "File removed",
          description: "File removed successfully"
        });
        
        setFile(null);
        setPreviewUrl(null);
        setUploadedKey(null);
        if (onChange) onChange(null);
      }
    } else {
      // Just clear the selected file
      setFile(null);
      setPreviewUrl(null);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{label}</div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      {!file ? (
        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            {acceptTypes.includes('image') ? 'PNG, JPG' : ''} 
            {acceptTypes.includes('image') && acceptTypes.includes('pdf') ? ' or ' : ''}
            {acceptTypes.includes('pdf') ? 'PDF' : ''} 
            {' '}up to 10MB
          </p>
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}>
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>Choose File</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {previewUrl && (
            <div className="mb-3 flex justify-center">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-32 max-w-full rounded border"
              />
            </div>
          )}
          
          {!uploadedKey ? (
            <Button 
              onClick={handleUpload} 
              disabled={isUploading} 
              className="w-full"
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Uploaded successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Get Started Stage Component
const getStartedSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  maritalStatus: z.string().min(1, "Please select a marital status"),
  dependants: z.string().min(1, "Please enter number of dependants")
});

const GetStartedStage = ({ onComplete }: { onComplete: () => void }) => {
  const form = useForm<z.infer<typeof getStartedSchema>>({
    resolver: zodResolver(getStartedSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      maritalStatus: "",
      dependants: "0"
    }
  });

  const onSubmit = (data: z.infer<typeof getStartedSchema>) => {
    console.log("Get Started data:", data);
    // Save to localStorage for persistence
    localStorage.setItem('application-data-personal', JSON.stringify(data));
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

// Identity Stage Component
const identitySchema = z.object({
  sin: z.string().min(9, "Valid SIN required").max(9, "SIN must be 9 digits"),
  dob: z.string().min(1, "Date of birth is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  yearsAtAddress: z.string(),
  housingStatus: z.string(),
  monthlyPayment: z.string(),
});

const IdentityStage = ({ onComplete }: { onComplete: () => void }) => {
  const { toast } = useToast();
  const [idFrontKey, setIdFrontKey] = useState<string | null>(null);
  const [idBackKey, setIdBackKey] = useState<string | null>(null);
  const [addressProofKey, setAddressProofKey] = useState<string | null>(null);
  
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
    if (!idFrontKey || !idBackKey || !addressProofKey) {
      toast({
        title: "Missing documents",
        description: "Please upload all required documents",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Identity data:", data);
    console.log("Document keys:", { idFrontKey, idBackKey, addressProofKey });
    
    // Save to localStorage for persistence
    localStorage.setItem('application-data-identity', JSON.stringify({
      ...data,
      documents: {
        idFront: idFrontKey,
        idBack: idBackKey,
        addressProof: addressProofKey
      }
    }));
    
    onComplete();
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
              <p className="text-sm text-blue-800 font-medium">AWS S3 Storage</p>
              <p className="text-sm text-blue-700 mt-1">
                Your documents will be securely uploaded and stored in Amazon S3.
                {!s3.isAWSConnected() && (
                  <span className="font-medium text-amber-600 block mt-1">
                    Please connect to AWS in settings first to enable document upload.
                  </span>
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload 
                    label="Front of ID"
                    description="Clear photo of the front of your ID"
                    acceptTypes="image/*"
                    bucket="user-documents"
                    folder="identity"
                    onChange={setIdFrontKey}
                  />
                  
                  <FileUpload 
                    label="Back of ID"
                    description="Clear photo of the back of your ID"
                    acceptTypes="image/*"
                    bucket="user-documents"
                    folder="identity"
                    onChange={setIdBackKey}
                  />
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Address Proof (Utility Bill or Bank Statement)</h4>
                <FileUpload 
                  label="Address Proof Document"
                  description="Recent utility bill or bank statement showing your address"
                  acceptTypes="image/*, application/pdf"
                  bucket="user-documents"
                  folder="identity"
                  onChange={setAddressProofKey}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={!s3.isAWSConnected()}
            >
              Continue to Employment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {!s3.isAWSConnected() && (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-100">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    AWS connection required. Please connect to AWS in settings to enable document uploads.
                  </p>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Placeholder components for the remaining stages
// These would be implemented similarly to the above components with document upload functionality

const EmploymentStage = ({ onComplete }: { onComplete: () => void }) => {
  const { toast } = useToast();
  const [paystub1Key, setPaystub1Key] = useState<string | null>(null);
  const [paystub2Key, setPaystub2Key] = useState<string | null>(null);
  const [employmentLetterKey, setEmploymentLetterKey] = useState<string | null>(null);
  
  const handleSubmit = () => {
    // Check if at least one document is uploaded
    if (!paystub1Key && !paystub2Key && !employmentLetterKey) {
      toast({
        title: "Missing documents",
        description: "Please upload at least one employment document",
        variant: "destructive"
      });
      return;
    }
    
    // Save document keys to localStorage
    localStorage.setItem('application-data-employment', JSON.stringify({
      documents: {
        paystub1: paystub1Key,
        paystub2: paystub2Key,
        employmentLetter: employmentLetterKey
      }
    }));
    
    onComplete();
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
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <FileUpload 
              label="Pay Stub (Last Month)"
              description="Recent pay stub showing your income"
              acceptTypes="image/*, application/pdf"
              bucket="user-documents"
              folder="employment"
              onChange={setPaystub1Key}
            />
            
            <FileUpload 
              label="Pay Stub (Previous Month)"
              description="Pay stub from the previous month"
              acceptTypes="image/*, application/pdf"
              bucket="user-documents"
              folder="employment"
              onChange={setPaystub2Key}
            />
            
            <FileUpload 
              label="Employment Letter"
              description="Letter from your employer confirming your position and income"
              acceptTypes="image/*, application/pdf"
              bucket="user-documents"
              folder="employment"
              onChange={setEmploymentLetterKey}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!s3.isAWSConnected()}
          >
            Continue to Assets <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          {!s3.isAWSConnected() && (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-100">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  AWS connection required. Please connect to AWS in settings to enable document uploads.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AssetsStage = ({ onComplete }: { onComplete: () => void }) => {
  const { toast } = useToast();
  const [bankStatementKey, setBankStatementKey] = useState<string | null>(null);
  const [investmentStatementKey, setInvestmentStatementKey] = useState<string | null>(null);
  
  const handleSubmit = () => {
    // Check if at least one document is uploaded
    if (!bankStatementKey && !investmentStatementKey) {
      toast({
        title: "Missing documents",
        description: "Please upload at least one financial document",
        variant: "destructive"
      });
      return;
    }
    
    // Save document keys to localStorage
    localStorage.setItem('application-data-assets', JSON.stringify({
      documents: {
        bankStatement: bankStatementKey,
        investmentStatement: investmentStatementKey
      }
    }));
    
    onComplete();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets & Liabilities (4 mins)</CardTitle>
        <CardDescription>
          Calculate your net worth and debt-to-income ratio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Please upload documents showing your financial assets and liabilities.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <FileUpload 
              label="Bank Statement"
              description="Recent bank statement showing your balances"
              acceptTypes="image/*, application/pdf"
              bucket="user-documents"
              folder="assets"
              onChange={setBankStatementKey}
            />
            
            <FileUpload 
              label="Investment Statement"
              description="RRSP, TFSA or other investment account statements"
              acceptTypes="image/*, application/pdf"
              bucket="user-documents"
              folder="assets"
              onChange={setInvestmentStatementKey}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!s3.isAWSConnected()}
          >
            Continue to Property Info <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          {!s3.isAWSConnected() && (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-100">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  AWS connection required. Please connect to AWS in settings to enable document uploads.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyStage = ({ onComplete }: { onComplete: () => void }) => {
  const { toast } = useToast();
  const [propertyTaxKey, setPropertyTaxKey] = useState<string | null>(null);
  const [mortgageStatementKey, setMortgageStatementKey] = useState<string | null>(null);
  
  const handleSubmit = () => {
    // For property, documents might be optional if they don't own property
    
    // Save document keys to localStorage
    localStorage.setItem('application-data-property', JSON.stringify({
      documents: {
        propertyTax: propertyTaxKey,
        mortgageStatement: mortgageStatementKey
      }
    }));
    
    onComplete();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Info</CardTitle>
        <CardDescription>
          Disclose existing properties and mortgages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                If you own property, please upload the following documents. Skip this step if you don't own property.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <FileUpload 
              label="Property Tax Bill"
              description="Most recent property tax assessment"
              acceptTypes="image/*, application/pdf"
              bucket="user-documents"
              folder="property"
              onChange={setPropertyTaxKey}
            />
            
            <FileUpload 
              label="Mortgage Statement"
              description="Recent mortgage statement showing balance and payment"
              acceptTypes="image/*, application/pdf"
              bucket="user-documents"
              folder="property"
              onChange={setMortgageStatementKey}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!s3.isAWSConnected()}
          >
            Continue to Final Step <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          {!s3.isAWSConnected() && (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-100">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  AWS connection required. Please connect to AWS in settings to enable document uploads.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const FinalStage = ({ onComplete }: { onComplete: () => void }) => {
  const { toast } = useToast();
  const [consent, setConsent] = useState(false);
  const [signatureKey, setSignatureKey] = useState<string | null>(null);
  
  const handleSubmit = () => {
    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please agree to the terms to complete your application",
        variant: "destructive"
      });
      return;
    }
    
    // Save document keys to localStorage
    localStorage.setItem('application-data-final', JSON.stringify({
      consent,
      documents: {
        signature: signatureKey
      }
    }));
    
    toast({
      title: "Application Complete",
      description: "Your mortgage application has been submitted successfully",
    });
    
    onComplete();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Declarations & Signatures (1-2 mins)</CardTitle>
        <CardDescription>
          Legally bind and confirm consent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Declaration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              By checking this box, I confirm that all information provided is accurate and complete.
              I consent to having my information shared with lenders for the purpose of mortgage application processing.
            </p>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="consent" 
                className="rounded"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <label htmlFor="consent" className="text-sm font-medium">
                I agree to the terms and consent to data sharing
              </label>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Digital Signature</h3>
            <FileUpload 
              label="Upload Signature"
              description="Upload an image of your signature"
              acceptTypes="image/*"
              bucket="user-documents"
              folder="signatures"
              onChange={setSignatureKey}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!consent || (!signatureKey && s3.isAWSConnected())}
          >
            Submit Application <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
          
          {!s3.isAWSConnected() && (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-100">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  AWS connection required. Please connect to AWS in settings to enable document uploads.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStageFlow;

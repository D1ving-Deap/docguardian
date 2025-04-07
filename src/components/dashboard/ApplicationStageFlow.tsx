
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
  ClipboardList 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
    console.log("Identity data:", data);
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
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Upload front of ID
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                  
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Upload back of ID
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Address Proof (Utility Bill or Bank Statement)</h4>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Upload proof of address document
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Continue to Employment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Placeholder components for the remaining stages
// These would be implemented similarly to the above components

const EmploymentStage = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment & Income (3-5 mins)</CardTitle>
        <CardDescription>
          Let's assess your income stability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Employment information form fields would go here...</p>
          <Button onClick={onComplete} className="w-full">
            Continue to Assets <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AssetsStage = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets & Liabilities (4 mins)</CardTitle>
        <CardDescription>
          Calculate your net worth and debt-to-income ratio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Assets and liabilities form fields would go here...</p>
          <Button onClick={onComplete} className="w-full">
            Continue to Property Info <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyStage = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Info</CardTitle>
        <CardDescription>
          Disclose existing properties and mortgages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Property information form fields would go here...</p>
          <Button onClick={onComplete} className="w-full">
            Continue to Final Step <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FinalStage = ({ onComplete }: { onComplete: () => void }) => {
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
              <input type="checkbox" id="consent" className="rounded" />
              <label htmlFor="consent" className="text-sm font-medium">
                I agree to the terms and consent to data sharing
              </label>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Digital Signature</h3>
            <div className="border-2 border-dashed rounded-lg p-6 h-32 flex items-center justify-center">
              <p className="text-sm text-center text-muted-foreground">
                Draw your signature here or click to sign
              </p>
            </div>
          </div>
          
          <Button onClick={onComplete} className="w-full">
            Submit Application <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStageFlow;

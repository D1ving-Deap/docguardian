
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  client_name: string;
  email: string;
  stage: string;
  progress: number;
  status: string;
  fraud_score: string | null;
  created_at: string;
}

const formSchema = z.object({
  client_name: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const ApplicationList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: "",
      email: "",
    },
  });

  useEffect(() => {
    fetchApplications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mortgage_applications'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mortgage_applications')
        .select('*')
        .is('deleted_at', null) // Only fetch non-deleted applications
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setApplications(data as Application[]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load mortgage applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createApplication = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await supabase
        .from('mortgage_applications')
        .insert({
          client_name: values.client_name,
          email: values.email,
          stage: 'Document Verification',
          progress: 0,
          status: 'Pending',
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "New mortgage application created",
      });
      
      form.reset();
      setIsDialogOpen(false);
      
      // Navigate to application stage flow with the new application ID
      navigate(`/dashboard/application-stages?id=${data.id}`);
      
    } catch (error) {
      console.error("Error creating application:", error);
      toast({
        title: "Error",
        description: "Failed to create new application",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (appId: string) => {
    setApplicationToDelete(appId);
    setIsDeleteDialogOpen(true);
  };
  
  const deleteApplication = async () => {
    if (!applicationToDelete) return;
    
    try {
      // Soft delete the application by setting the deleted_at timestamp
      const { error } = await supabase
        .from('mortgage_applications')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'Deleted'
        })
        .eq('id', applicationToDelete);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Application has been deleted",
      });
      
      // Remove the deleted application from the local state
      setApplications(applications.filter(app => app.id !== applicationToDelete));
      
    } catch (error) {
      console.error("Error deleting application:", error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

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

  const handleViewDetails = (appId: string) => {
    navigate(`/dashboard/application-stages?id=${appId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mortgage Applications</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
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
                  
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {app.email}
                  </div>
                  
                  {app.fraud_score && (
                    <div className="text-sm flex items-center">
                      <span className="font-medium">Fraud Score:</span> 
                      <span className="ml-1 flex items-center">
                        {app.fraud_score} 
                        {app.fraud_score === 'High' && (
                          <AlertTriangle className="ml-1 h-4 w-4 text-red-500" />
                        )}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Created on {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewDetails(app.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="p-0 h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => confirmDelete(app.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New Application Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mortgage Application</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(createApplication)} className="space-y-4">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
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
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="client@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Application</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={deleteApplication}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationList;

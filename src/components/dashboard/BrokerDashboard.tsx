import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Mail, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  BarChart3,
  Search,
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAppData } from '@/contexts/AppDataContext';

interface BrokerDashboardProps {
  activeTab: string;
}

const BrokerDashboard: React.FC<BrokerDashboardProps> = ({ activeTab }) => {
  const { toast } = useToast();
  const { 
    clients, 
    applications, 
    addClient, 
    loading 
  } = useAppData();
  
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isInviteClientOpen, setIsInviteClientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [inviteData, setInviteData] = useState({
    email: '',
    applicationType: 'mortgage'
  });

  // Calculate stats from the data
  const clientStats = {
    total: clients.length,
    active: clients.length, // All clients are considered active for now
    pendingInvites: 0 // Mock value
  };

  const applicationStats = {
    total: applications.length,
    completed: applications.filter(a => a.status === 'completed').length,
    pending: applications.filter(a => a.status === 'pending').length,
    inProgress: applications.filter(a => a.status === 'in_progress').length,
    successRate: applications.length > 0 ? 
      Math.round((applications.filter(a => a.status === 'completed').length / applications.length) * 100) : 0
  };

  const handleAddClient = async () => {
    try {
      await addClient({
        full_name: newClient.name,
        email: newClient.email
      });

      setNewClient({ name: '', email: '', phone: '' });
      setIsAddClientOpen(false);

      toast({
        title: "Client added successfully",
        description: `${newClient.name} has been added to your client list.`,
      });
    } catch (error) {
      toast({
        title: "Error adding client",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInviteClient = async () => {
    try {
      toast({
        title: "Invitation sent",
        description: `Application invitation sent to ${inviteData.email}`,
      });

      setInviteData({ email: '', applicationType: 'mortgage' });
      setIsInviteClientOpen(false);
    } catch (error) {
      toast({
        title: "Error sending invitation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'none':
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Activity className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const filteredClients = clients.filter(client =>
    client.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.client?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplications = applications.filter(app =>
    app.applicant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {clientStats.active} active clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications In Progress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Across all clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on completed applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Client Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.pendingInvites}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for response
            </p>
          </CardContent>
        </Card>
      </div>
  );

  const renderClients = () => (
    <Card>
      <CardHeader>
        <CardTitle>My Clients</CardTitle>
        <CardDescription>
          Manage your clients and their applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.client?.full_name || 'Unknown'}</TableCell>
                <TableCell>{client.client?.email || 'No email'}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderApplications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Client Applications</CardTitle>
        <CardDescription>
          Track the progress of all client applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.applicant?.full_name || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1">{application.status.replace('_', ' ')}</span>
                  </Badge>
                </TableCell>
                <TableCell>{application.stage}</TableCell>
                <TableCell>{new Date(application.updated_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for funnel chart */}
          <div className="h-64 bg-muted flex items-center justify-center rounded-md">
            <p>Application Funnel Chart</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Avg. Application Time</span>
            <strong>5.6 days</strong>
          </div>
          <Progress value={70} />
          <div className="flex justify-between">
            <span>Client Conversion Rate</span>
            <strong>65%</strong>
          </div>
          <Progress value={65} />
        </CardContent>
      </Card>
    </div>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'clients':
        return renderClients();
      case 'applications':
        return renderApplications();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Broker Dashboard</h1>
          <p className="text-muted-foreground">Manage your clients and their mortgage applications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients or applications..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Manually add a new client to your list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-name">Full Name</Label>
                  <Input id="client-name" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="client-email">Email</Label>
                  <Input id="client-email" type="email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="client-phone">Phone</Label>
                  <Input id="client-phone" type="tel" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
                <Button onClick={handleAddClient}>Add Client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isInviteClientOpen} onOpenChange={setIsInviteClientOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Invite Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Client to Apply</DialogTitle>
                <DialogDescription>
                  Send an invitation to a client to start a new application.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Client Email</Label>
                  <Input id="invite-email" type="email" value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="invite-app-type">Application Type</Label>
                  <Select value={inviteData.applicationType} onValueChange={(value) => setInviteData({...inviteData, applicationType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mortgage">Mortgage Application</SelectItem>
                      <SelectItem value="refinance">Refinance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteClientOpen(false)}>Cancel</Button>
                <Button onClick={handleInviteClient}>Send Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default BrokerDashboard; 
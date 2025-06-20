import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAppData } from '@/contexts/AppDataContext';

interface ManagerDashboardProps {
  activeTab: string;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ activeTab }) => {
  const { toast } = useToast();
  const { 
    agents, 
    applications, 
    addAgent, 
    loading 
  } = useAppData();
  
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [isSendInviteOpen, setIsSendInviteOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    role: 'agent'
  });

  const [inviteData, setInviteData] = useState({
    email: '',
    message: '',
    applicationType: 'mortgage'
  });

  // Calculate stats from the data
  const agentStats = {
    total: agents.length,
    active: agents.filter(a => a.role === 'broker').length,
    avgCompletionRate: 85 // Mock value for now
  };

  const applicationStats = {
    total: applications.length,
    completed: applications.filter(a => a.status === 'completed').length,
    pending: applications.filter(a => a.status === 'pending').length,
    inProgress: applications.filter(a => a.status === 'in_progress').length
  };

  const handleCreateAgent = async () => {
    try {
      await addAgent({
        full_name: newAgent.name,
        email: newAgent.email
      });

      setNewAgent({ name: '', email: '', role: 'agent' });
      setIsCreateAgentOpen(false);

      toast({
        title: "Agent created successfully",
        description: `${newAgent.name} has been added to your team.`,
      });
    } catch (error) {
      toast({
        title: "Error creating agent",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendInvite = async () => {
    try {
      // Mock API call - replace with actual email sending implementation
      toast({
        title: "Invitation sent",
        description: `Application invitation sent to ${inviteData.email}`,
      });

      setInviteData({ email: '', message: '', applicationType: 'mortgage' });
      setIsSendInviteOpen(false);
    } catch (error) {
      toast({
        title: "Error sending invitation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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
  
  const filteredApplications = applications.filter((application) => {
    if (statusFilter === 'all') return true;
    return application.status === statusFilter;
  });

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
          <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{agentStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {agentStats.active} active
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applicationStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {applicationStats.completed} completed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{agentStats.avgCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Across all agents
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applicationStats.pending}</div>
          <p className="text-xs text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgents = () => (
    <Card>
      <CardHeader>
        <CardTitle>Team Agents</CardTitle>
        <CardDescription>
          Manage your team of agents and track their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{agent.full_name}</div>
                    <div className="text-sm text-muted-foreground">{agent.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="ml-1">Active</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{agent.role}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    View Details
                  </Button>
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
        <CardTitle>Application Tracking</CardTitle>
        <CardDescription>
          Monitor all applications and their current stages
        </CardDescription>
        <div className="flex items-center space-x-2 pt-2">
          <Label htmlFor="status-filter">Filter by status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <TableCell>
                  <div>
                    <div className="font-medium">{application.applicant?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{application.applicant?.email || 'No email'}</div>
                  </div>
                </TableCell>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Team performance metrics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Average Processing Time</span>
                <span className="font-medium">3.2 days</span>
              </div>
              <Progress value={65} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Application Success Rate</span>
                <span className="font-medium">89%</span>
              </div>
              <Progress value={89} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Customer Satisfaction</span>
                <span className="font-medium">4.8/5</span>
              </div>
              <Progress value={96} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Application completed</p>
                <p className="text-xs text-muted-foreground">Bob Wilson's mortgage application approved</p>
              </div>
              <span className="text-xs text-muted-foreground">2h ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Document uploaded</p>
                <p className="text-xs text-muted-foreground">Alice Brown uploaded income verification</p>
              </div>
              <span className="text-xs text-muted-foreground">4h ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New application started</p>
                <p className="text-xs text-muted-foreground">Charlie Davis began mortgage application</p>
              </div>
              <span className="text-xs text-muted-foreground">1d ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'agents':
        return renderAgents();
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
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage your team and track application progress</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateAgentOpen} onOpenChange={setIsCreateAgentOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Agent Account</DialogTitle>
                <DialogDescription>
                  Add a new agent to your team. They will receive an email invitation to join.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent-name">Full Name</Label>
                  <Input
                    id="agent-name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="Enter agent's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-email">Email</Label>
                  <Input
                    id="agent-email"
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    placeholder="agent@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-role">Role</Label>
                  <Select value={newAgent.role} onValueChange={(value) => setNewAgent({ ...newAgent, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="senior_agent">Senior Agent</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateAgentOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAgent}>Create Agent</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isSendInviteOpen} onOpenChange={setIsSendInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Application Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Application Invitation</DialogTitle>
                <DialogDescription>
                  Send an application invitation to a new applicant. They will receive an email with a secure link to start their application.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Applicant Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="applicant@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="application-type">Application Type</Label>
                  <Select value={inviteData.applicationType} onValueChange={(value) => setInviteData({ ...inviteData, applicationType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mortgage">Mortgage Application</SelectItem>
                      <SelectItem value="refinance">Refinance Application</SelectItem>
                      <SelectItem value="home_equity">Home Equity Application</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                  <Textarea
                    id="invite-message"
                    value={inviteData.message}
                    onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                    placeholder="Add a personal message to the invitation..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSendInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvite}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default ManagerDashboard;
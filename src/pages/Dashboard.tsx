import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import BrokerDashboard from '@/components/dashboard/BrokerDashboard';
import ApplicantDashboard from '@/components/dashboard/ApplicantDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building,
  CreditCard,
  UserPlus,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { supabase } from '@/integrations/supabase/client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

type UserRole = 'manager' | 'broker' | 'applicant' | 'admin';

const AdminDashboardContent: React.FC = () => {
  const { toast } = useToast();
  // We will need to fetch settings from a context later
  const [settings, setSettings] = useState({
    business_info: { name: '', email: '', phone: '', address: '', website: '' },
    regional: { province: 'Ontario', supported_provinces: [] },
    system: { maintenance_mode: false, debug_mode: false }
  });
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('settings').select('key, value');
      if (error) {
        toast({ title: 'Error fetching settings', description: error.message, variant: 'destructive' });
        return;
      }
      const newSettings = data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as any);
      setSettings(newSettings);
    };
    fetchSettings();
  }, [toast]);

  const handleSettingChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    const updates = Object.entries(settings).map(([key, value]) => 
      supabase.from('settings').update({ value }).eq('key', key)
    );
    const results = await Promise.all(updates);
    const hasError = results.some(res => res.error);

    if (hasError) {
      toast({ title: 'Error saving settings', description: 'One or more settings failed to save.', variant: 'destructive' });
    } else {
      toast({ title: 'Settings saved', description: 'System settings have been updated successfully.' });
    }
  };

  const renderSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>
          Configure system-wide settings and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Business Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input id="business-name" value={settings.business_info.name} onChange={(e) => handleSettingChange('business_info', 'name', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="business-email">Contact Email</Label>
              <Input id="business-email" type="email" value={settings.business_info.email} onChange={(e) => handleSettingChange('business_info', 'email', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="business-phone">Phone Number</Label>
              <Input id="business-phone" value={settings.business_info.phone} onChange={(e) => handleSettingChange('business_info', 'phone', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="business-website">Website</Label>
              <Input id="business-website" value={settings.business_info.website} onChange={(e) => handleSettingChange('business_info', 'website', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="business-address">Address</Label>
              <Textarea id="business-address" value={settings.business_info.address} onChange={(e) => handleSettingChange('business_info', 'address', e.target.value)} />
            </div>
          </div>
        </div>
        
        {/* Regional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Regional Settings</h3>
          <div>
            <Label>Supported Provinces</Label>
            <p className="text-sm text-muted-foreground">These provinces will be available in application forms.</p>
            {/* This could be a multi-select component in the future */}
            <Input value={(settings.regional.supported_provinces || []).join(', ')} onChange={e => handleSettingChange('regional', 'supported_provinces', e.target.value.split(',').map(s => s.trim()))} />
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">System Controls</h3>
          <div className="flex items-center space-x-2">
            <Switch id="maintenance-mode" checked={settings.system.maintenance_mode} onCheckedChange={(checked) => handleSettingChange('system', 'maintenance_mode', checked)} />
            <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
          </div>
          <p className="text-sm text-muted-foreground">Puts the platform in maintenance mode, restricting access for non-admins.</p>
          <div className="flex items-center space-x-2">
            <Switch id="debug-mode" checked={settings.system.debug_mode} onCheckedChange={(checked) => handleSettingChange('system', 'debug_mode', checked)} />
            <Label htmlFor="debug-mode">Enable Debug Mode</Label>
          </div>
          <p className="text-sm text-muted-foreground">Enables detailed logging and debugging features across the platform.</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <div>User Management Content</div>;
      case 'system':
        return <div>System Status Content</div>;
      case 'settings':
        return renderSettings();
      default:
        return <div>User Management Content</div>;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="users">User Management</TabsTrigger>
        <TabsTrigger value="system">System Status</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        {/* Replace with User Management component */}
        <Card><CardHeader><CardTitle>User Management</CardTitle></CardHeader><CardContent><p>User management interface will be here.</p></CardContent></Card>
      </TabsContent>
      <TabsContent value="system">
        {/* Replace with System Status component */}
        <Card><CardHeader><CardTitle>System Status</CardTitle></CardHeader><CardContent><p>System status interface will be here.</p></CardContent></Card>
      </TabsContent>
      <TabsContent value="settings">
        {renderSettings()}
      </TabsContent>
    </Tabs>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole>('applicant');
  const [activeTab, setActiveTab] = useState('overview');

  const navigateTo = (role: UserRole, tab: string) => {
    setCurrentRole(role);
    setActiveTab(tab);
  };

  useEffect(() => {
    if (user?.email === 'laijack051805@gmail.com') {
      setCurrentRole('admin');
    } else if (user?.user_metadata?.role) {
      setCurrentRole(user.user_metadata.role as UserRole);
    } else {
      setCurrentRole('applicant');
    }
  }, [user]);

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and platform management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigateTo('manager', 'overview')}>
            Switch to Manager
          </Button>
          <Button variant="outline" onClick={() => navigateTo('broker', 'overview')}>
            Switch to Broker
          </Button>
          <Button variant="outline" onClick={() => navigateTo('applicant', 'overview')}>
            Switch to Applicant
          </Button>
        </div>
      </div>
      <AdminDashboardContent />
    </div>
  );

  if (!user) {
    return <Navigate to="/login" />;
  }

  const getDashboardComponent = () => {
    switch (currentRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard activeTab={activeTab} />;
      case 'broker':
        return <BrokerDashboard activeTab={activeTab} />;
      case 'applicant':
        return <ApplicantDashboard />;
      default:
        return <div>Select a role to view dashboard</div>;
    }
  };

  return (
    <SidebarProvider>
      <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <DashboardSidebar 
            currentRole={currentRole} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col flex-1">
            <DashboardHeader onNavigate={navigateTo} />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
              {getDashboardComponent()}
            </main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarProvider>
  );
};

export default Dashboard;

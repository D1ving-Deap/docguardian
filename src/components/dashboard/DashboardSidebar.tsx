import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  User,
  Settings,
  Shield,
  BarChart3
} from 'lucide-react';

interface DashboardSidebarProps {
  currentRole: 'admin' | 'manager' | 'broker' | 'applicant';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
}) => {
  const { state } = useSidebar();

  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { name: 'Overview', icon: LayoutDashboard, tab: 'overview' },
          { name: 'User Management', icon: Users, tab: 'users' },
          { name: 'System Status', icon: Shield, tab: 'system' },
          { name: 'Settings', icon: Settings, tab: 'settings' },
        ];
      case 'manager':
        return [
          { name: 'Overview', icon: LayoutDashboard, tab: 'overview' },
          { name: 'Team Agents', icon: Users, tab: 'agents' },
          { name: 'Applications', icon: FileText, tab: 'applications' },
          { name: 'Analytics', icon: BarChart3, tab: 'analytics' },
        ];
      case 'broker':
        return [
          { name: 'Overview', icon: LayoutDashboard, tab: 'overview' },
          { name: 'My Clients', icon: Briefcase, tab: 'clients' },
          { name: 'Applications', icon: FileText, tab: 'applications' },
          { name: 'Analytics', icon: BarChart3, tab: 'analytics' },
        ];
      case 'applicant':
        return [
          { name: 'My Application', icon: FileText, tab: 'overview' },
          { name: 'Documents', icon: Users, tab: 'documents' },
          { name: 'Profile', icon: User, tab: 'profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">
          {state === 'collapsed' ? 'VF' : 'VerifyFlow'}
        </h2>
        <p className={cn(
          "text-xs text-muted-foreground transition-opacity duration-300",
          state === 'collapsed' && 'opacity-0'
        )}>
          {currentRole.toUpperCase()} VIEW
        </p>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={activeTab === item.tab ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange(item.tab)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {state === 'expanded' && item.name}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;

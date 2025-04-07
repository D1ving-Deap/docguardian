
import { Home, Users, FileText, AlertTriangle, Settings } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { useState } from "react";

const DashboardSidebar = ({ activePage, setActivePage }: { 
  activePage: string, 
  setActivePage: (page: string) => void 
}) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="pl-2 text-center font-semibold text-lg">
          Mortgage Verification
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activePage === "overview"} 
              onClick={() => setActivePage("overview")}
            >
              <Home />
              <span>Overview</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activePage === "applications"} 
              onClick={() => setActivePage("applications")}
            >
              <FileText />
              <span>Applications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activePage === "clients"} 
              onClick={() => setActivePage("clients")}
            >
              <Users />
              <span>Clients</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activePage === "alerts"} 
              onClick={() => setActivePage("alerts")}
            >
              <AlertTriangle />
              <span>Fraud Alerts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={activePage === "settings"} 
              onClick={() => setActivePage("settings")}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;

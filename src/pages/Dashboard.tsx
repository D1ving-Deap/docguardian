
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ApplicationList from "@/components/dashboard/ApplicationList";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import FraudAlertsList from "@/components/dashboard/FraudAlertsList";
import AWSIntegration from "@/components/dashboard/AWSIntegration";
import ApplicationStageFlow from "@/components/dashboard/ApplicationStageFlow";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("overview");
  const location = useLocation();
  
  useEffect(() => {
    // Extract the path without any query parameters
    const path = location.pathname.split('/').pop() || "";
    
    // Set active page based on current route
    if (path === "dashboard") {
      setActivePage("overview");
    } else if (path) {
      setActivePage(path);
    }
  }, [location]);

  const renderActivePage = () => {
    switch (activePage) {
      case "overview":
        return <DashboardOverview />;
      case "applications":
        return <ApplicationList />;
      case "application-stages":
        return <ApplicationStageFlow />;
      case "alerts":
        return <FraudAlertsList />;
      case "settings":
        return <AWSIntegration />;
      case "clients":
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Clients</h2>
            <p>Client management interface will be implemented here.</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="grid md:block">
        <DashboardHeader />
        <div className="flex">
          <DashboardSidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {renderActivePage()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

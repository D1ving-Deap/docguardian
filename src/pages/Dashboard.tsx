import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ApplicationList from "@/components/dashboard/ApplicationList";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import FraudAlertsList from "@/components/dashboard/FraudAlertsList";
import AWSIntegration from "@/components/dashboard/AWSIntegration";
import ApplicationStageFlow from "@/components/dashboard/ApplicationStageFlow";
import BrokerDashboard from "@/components/dashboard/BrokerDashboard";
import ApplicantDashboard from "@/components/dashboard/ApplicantDashboard";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("overview");
  const [userRole, setUserRole] = useState<'broker' | 'applicant'>('broker'); // Default to broker for demo
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Check for page parameter in URL
    const pageParam = searchParams.get('page');
    if (pageParam && ['overview', 'applications', 'application-stages', 'alerts', 'settings', 'clients', 'broker', 'applicant'].includes(pageParam)) {
      setActivePage(pageParam);
      return;
    }
    
    // Check for role parameter
    const roleParam = searchParams.get('role');
    if (roleParam && ['broker', 'applicant'].includes(roleParam)) {
      setUserRole(roleParam as 'broker' | 'applicant');
    }
    
    // Extract the path without any query parameters
    const path = location.pathname.split('/').pop() || "";
    
    // Set active page based on current route
    if (path === "dashboard") {
      setActivePage("overview");
    } else if (path && ['overview', 'applications', 'application-stages', 'alerts', 'settings', 'clients', 'broker', 'applicant'].includes(path)) {
      setActivePage(path);
    } else {
      setActivePage("overview");
    }
  }, [location, searchParams]);

  const renderActivePage = () => {
    // Role-based dashboard rendering
    if (userRole === 'applicant') {
      return <ApplicantDashboard />;
    }

    // Broker dashboard pages
    switch (activePage) {
      case "broker":
        return <BrokerDashboard />;
      case "applicant":
        return <ApplicantDashboard />;
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

  // Show role selector for demo purposes
  const RoleSelector = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Select Dashboard Role (Demo)</h3>
      <div className="flex gap-2">
        <button
          onClick={() => setUserRole('broker')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            userRole === 'broker'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Broker Dashboard
        </button>
        <button
          onClick={() => setUserRole('applicant')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            userRole === 'applicant'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Applicant Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="grid md:block">
        <DashboardHeader />
        <div className="flex">
          <DashboardSidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <RoleSelector />
            {renderActivePage()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

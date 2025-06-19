import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Settings,
  Menu,
  AlertTriangle,
  Users,
  ClipboardList,
  Cloud,
} from "lucide-react";

interface DashboardSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const DashboardSidebar = ({
  activePage,
  setActivePage,
}: DashboardSidebarProps) => {
  const { open, setOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const navigation = [
    {
      name: "Overview",
      icon: <BarChart3 className="h-5 w-5" />,
      value: "overview",
    },
    {
      name: "Applications",
      icon: <FileText className="h-5 w-5" />,
      value: "applications",
    },
    {
      name: "Application Stages",
      icon: <ClipboardList className="h-5 w-5" />,
      value: "application-stages",
    },
    {
      name: "Fraud Alerts",
      icon: <AlertTriangle className="h-5 w-5" />,
      value: "alerts",
    },
    {
      name: "Clients",
      icon: <Users className="h-5 w-5" />,
      value: "clients",
    },
    {
      name: "AWS Integration",
      icon: <Cloud className="h-5 w-5" />,
      value: "settings",
    },
  ];

  const handlePageChange = (pageValue: string) => {
    setActivePage(pageValue);
    
    // Update URL with page parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', pageValue);
    setSearchParams(newSearchParams);
    
    // Close mobile sidebar if open
    if (isMobile) setOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-3 my-2">
        <h2 className="text-lg font-semibold mb-2 px-4">Dashboard</h2>
        <div className="space-y-1">
          {navigation.map((item) => (
            <Button
              key={item.value}
              variant={activePage === item.value ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handlePageChange(item.value)}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full md:hidden shadow-md bg-primary text-primary-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={`border-r bg-background transition-all duration-300 hidden md:block overflow-y-auto ${
        open ? "w-64" : "w-[70px]"
      }`}
    >
      <SidebarContent />
    </div>
  );
};

export default DashboardSidebar;

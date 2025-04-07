
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <a 
            href="/dashboard" 
            className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          >
            VerifyFlow Dashboard
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2 items-center">
            <div className="text-sm text-gray-600">
              {user?.email}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

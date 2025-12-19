import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import CustomerDashboard from "./customer-dashboard";
import ChefDashboard from "./chef-dashboard";
import AdminDashboard from "./admin-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@shared/schema";

export default function DashboardRouter() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: userRole, isLoading: roleLoading } = useQuery<UserRole>({
    queryKey: ["/api/user/role", user?.id],
    enabled: isAuthenticated && !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
    queryFn: async () => {
      const res = await fetch("/api/user/role", { credentials: "include" });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      return res.json();
    },
  });

  console.log("DashboardRouter state:", { user, authLoading, isAuthenticated, roleLoading });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to home");
    return <Redirect to="/" />;
  }

  const role = userRole?.role || "customer";

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "chef":
      return <ChefDashboard />;
    default:
      return <CustomerDashboard />;
  }
}

import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
  [key: string]: any;
}

export default function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { data: authData, isLoading } = useQuery({
    queryKey: ["auth-check"],
    queryFn: () => authAPI.me(),
    retry: false,
  });

  const user = authData?.user;

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    } else if (!isLoading && user && adminOnly && user.role !== "admin" && user.role !== "superadmin") {
      setLocation("/not-authorized");
    }
  }, [user, isLoading, adminOnly, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (adminOnly && user.role !== "admin" && user.role !== "superadmin")) {
    return null;
  }

  return <Component {...rest} />;
}

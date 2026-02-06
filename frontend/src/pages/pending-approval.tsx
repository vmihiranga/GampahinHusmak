import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PendingApproval() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex justify-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <Clock className="w-12 h-12" />
              </div>
            </div>
            <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is currently under review by our administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email Verification</p>
                  <p className="text-xs text-muted-foreground">
                    We'll send you an email once your account is approved.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">What's Next?</p>
                  <p className="text-xs text-muted-foreground">
                    Our team will review your account within 24-48 hours. You'll receive an email once approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Having trouble? Contact us at <br />
                <a href="mailto:gampahinhusmak@gmail.com" className="text-primary hover:underline font-medium">
                  gampahinhusmak@gmail.com
                </a>
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

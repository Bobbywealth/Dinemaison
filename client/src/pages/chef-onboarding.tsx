import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, AlertCircle, CreditCard, ArrowLeft } from "lucide-react";

export default function ChefOnboardingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: chefProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/chef/profile"],
    enabled: !!user,
  });

  const { data: stripeStatus, isLoading: stripeLoading } = useQuery<{
    connected: boolean;
    onboarded: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  }>({
    queryKey: ["/api/chef/stripe-connect/status"],
    enabled: !!chefProfile,
  });

  const onboardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/chef/stripe-connect/onboard", {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start payment setup. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    if (!profileLoading && user && !chefProfile) {
      navigate("/become-chef");
    }
  }, [chefProfile, profileLoading, user, navigate]);

  if (userLoading || profileLoading || stripeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !chefProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isFullyOnboarded = stripeStatus?.onboarded;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
          data-testid="button-back-dashboard"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="h-6 w-6" />
              Payment Setup
            </CardTitle>
            <CardDescription>
              Set up your payment account to receive earnings from your bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  {isFullyOnboarded ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : stripeStatus?.connected ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Stripe Connect Account</p>
                    <p className="text-sm text-muted-foreground">
                      {isFullyOnboarded
                        ? "Your account is verified and ready to receive payments"
                        : stripeStatus?.connected
                        ? "Account created, but setup is incomplete"
                        : "Connect your bank account to receive payments"}
                    </p>
                  </div>
                </div>
                <Badge variant={isFullyOnboarded ? "default" : "secondary"}>
                  {isFullyOnboarded ? "Active" : stripeStatus?.connected ? "Pending" : "Not Set Up"}
                </Badge>
              </div>

              {isFullyOnboarded && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">
                        You're all set!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                        Your payment account is fully configured. You'll automatically receive
                        payouts for completed bookings based on your commission rate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {stripeStatus?.connected && !isFullyOnboarded && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">
                        Complete your setup
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                        Your Stripe account needs additional information before you can receive
                        payments. Click below to complete your setup.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                {!isFullyOnboarded && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => onboardMutation.mutate()}
                    disabled={onboardMutation.isPending}
                    data-testid="button-setup-payments"
                  >
                    {onboardMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : stripeStatus?.connected ? (
                      "Complete Setup"
                    ) : (
                      "Set Up Payments"
                    )}
                  </Button>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground">1.</span>
                    Connect your bank account securely through Stripe
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground">2.</span>
                    Customers pay for bookings through our secure checkout
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground">3.</span>
                    After your event is completed, we transfer your earnings minus our platform fee
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground">4.</span>
                    Payouts typically arrive in 2-3 business days
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

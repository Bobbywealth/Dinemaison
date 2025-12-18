import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt, UpdatePrompt } from "@/components/pwa";
import { NetworkStatus } from "@/components/pwa/network-status";
import LandingPage from "@/pages/landing";
import ChefsPage from "@/pages/chefs";
import ChefProfilePage from "@/pages/chef-profile";
import BecomeChefPage from "@/pages/become-chef";
import BookingPage from "@/pages/booking";
import ChefOnboardingPage from "@/pages/chef-onboarding";
import AddMenuItemPage from "@/pages/chef/add-menu-item";
import DashboardRouter from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import ContactPage from "@/pages/contact";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { debug } from "./utils/debug";

function Router() {
  useEffect(() => {
    debug.log("Router mounted", { path: window.location.pathname });
  }, []);
  
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <Route path="/chefs" component={ChefsPage} />
      <Route path="/chefs/:id" component={ChefProfilePage} />
      <Route path="/become-chef" component={BecomeChefPage} />
      <Route path="/book/:id" component={BookingPage} />
      <Route path="/chef/onboarding" component={ChefOnboardingPage} />
      <Route path="/chef/menu/add" component={AddMenuItemPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/dashboard" component={DashboardRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    debug.log("App component mounted");
    
    // Test API connectivity
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        debug.log("Health check successful", data);
      })
      .catch(error => {
        debug.error("Health check failed", error);
      });
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <NetworkStatus />
            <InstallPrompt />
            <UpdatePrompt />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

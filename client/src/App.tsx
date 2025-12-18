import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt, UpdatePrompt, SplashScreen, AppTour, useSplashScreen } from "@/components/pwa";
import { NetworkStatus } from "@/components/pwa/network-status";
import LandingPage from "@/pages/landing";
import ChefsPage from "@/pages/chefs";
import ChefProfilePage from "@/pages/chef-profile";
import BecomeChefPage from "@/pages/become-chef";
import BookingPage from "@/pages/booking";
import ChefOnboardingPage from "@/pages/chef-onboarding";
import AddMenuItemPage from "@/pages/chef/add-menu-item";
import EditChefProfilePage from "@/pages/chef/edit-profile";
import DashboardRouter from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import ContactPage from "@/pages/contact";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import AboutPage from "@/pages/about";
import FAQPage from "@/pages/faq";
import StyleGuidePage from "@/pages/styleguide";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { debug } from "./utils/debug";
import { useAuth } from "./hooks/use-auth";
import { isStandalone } from "./lib/native-features";

function Router() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    debug.log("Router mounted", { path: window.location.pathname });
  }, []);

  // Redirect to login if it's first visit and user is not authenticated - ONLY for PWA app
  useEffect(() => {
    if (!isLoading) {
      const isFirstVisit = !sessionStorage.getItem("dinemaison-visited");
      const isAuthPage = location === "/login" || location === "/signup" || location === "/forgot-password" || location.startsWith("/reset-password");
      const isPWA = isStandalone();
      
      debug.log("Navigation check:", {
        isFirstVisit,
        isAuthPage,
        isPWA,
        hasUser: !!user,
        location,
        willRedirect: isFirstVisit && !user && !isAuthPage && location === "/" && isPWA
      });
      
      // Only redirect to login if running as PWA (standalone mode)
      if (isFirstVisit && !user && !isAuthPage && location === "/" && isPWA) {
        debug.log("First visit detected in PWA mode, redirecting to login");
        setLocation("/login");
      } else if (isFirstVisit && !isPWA) {
        debug.log("First visit on mobile web, staying on homepage");
      }
      
      // Mark as visited after check
      if (!sessionStorage.getItem("dinemaison-visited")) {
        sessionStorage.setItem("dinemaison-visited", "true");
      }
    }
  }, [isLoading, user, location, setLocation]);
  
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
      <Route path="/chef/profile/edit" component={EditChefProfilePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/styleguide" component={StyleGuidePage} />
      <Route path="/dashboard" component={DashboardRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { showSplash, handleComplete } = useSplashScreen({ 
    duration: 2500,
    skipOnRevisit: false 
  });

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
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <NetworkStatus />
            <InstallPrompt />
            <UpdatePrompt />
            {showSplash && <SplashScreen duration={2500} onComplete={handleComplete} />}
            <AppTour />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

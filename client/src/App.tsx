import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  InstallPrompt,
  UpdatePrompt,
  SplashScreen,
  AppTour,
  useSplashScreen,
} from "@/components/pwa";
import { NetworkStatus } from "@/components/pwa/network-status";
import { NotificationToastListener } from "@/components/notifications/notification-toast";
import { debug } from "./utils/debug";
import { useAuth } from "./hooks/use-auth";
import { isStandalone } from "./lib/native-features";
import { logNavigationComplete } from "./lib/navigation-metrics";
import { Spinner } from "./components/ui/loading";

const LandingPage = lazy(() => import("@/pages/landing"));
const ChefsPage = lazy(() => import("@/pages/chefs"));
const ChefProfilePage = lazy(() => import("@/pages/chef-profile"));
const BecomeChefPage = lazy(() => import("@/pages/become-chef"));
const BookingPage = lazy(() => import("@/pages/booking"));
const ChefOnboardingPage = lazy(() => import("@/pages/chef-onboarding"));
const AddMenuItemPage = lazy(() => import("@/pages/chef/add-menu-item"));
const EditChefProfilePage = lazy(() => import("@/pages/chef/edit-profile"));
const DashboardRouter = lazy(() => import("@/pages/dashboard"));
const LoginPage = lazy(() => import("@/pages/login"));
const SignupPage = lazy(() => import("@/pages/signup"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const ContactPage = lazy(() => import("@/pages/contact"));
const TermsPage = lazy(() => import("@/pages/terms"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const AboutPage = lazy(() => import("@/pages/about"));
const FAQPage = lazy(() => import("@/pages/faq"));
const StyleGuidePage = lazy(() => import("@/pages/styleguide"));
const NotificationSettingsPage = lazy(() => import("@/pages/notification-settings"));
const TasksPage = lazy(() => import("@/pages/tasks"));
const ShareHandlerPage = lazy(() => import("@/pages/share-handler"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  useEffect(() => {
    const start = performance.now();
    let logged = false;
    const handle = () => {
      if (logged) return;
      logged = true;
      logNavigationComplete(location, start);
    };

    // Use RAF to capture after-paint timing without blocking UI
    const raf = requestAnimationFrame(() => {
      handle();
      // Minimal idle callback to allow data fetch/render to settle
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(handle, { timeout: 500 });
      } else {
        setTimeout(handle, 0);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [location]);

  useEffect(() => {
    debug.log("Router mounted", { path: window.location.pathname });
  }, []);

  // Redirect to login for unauthenticated users - ONLY for PWA app
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage =
      location === "/login" ||
      location === "/signup" ||
      location === "/forgot-password" ||
      location.startsWith("/reset-password");
    const isPWA = isStandalone();

    debug.log("Navigation check:", {
      isAuthPage,
      isPWA,
      hasUser: !!user,
      location,
      willRedirectToLogin: isPWA && !user && !isAuthPage && location === "/",
      willRedirectToDashboard: isPWA && !!user && location === "/",
    });

    if (isPWA && location === "/") {
      // In PWA mode, never land on marketing home. Go to dashboard if authed, else login.
      if (user) {
        setLocation("/dashboard");
      } else if (!isAuthPage) {
        setLocation("/login");
      }
    }
  }, [isLoading, user, location, setLocation]);
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Spinner /></div>}>
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
        <Route path="/notification-settings" component={NotificationSettingsPage} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/share" component={ShareHandlerPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
            <NotificationToastListener />
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

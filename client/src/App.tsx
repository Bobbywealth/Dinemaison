import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import LandingPage from "@/pages/landing";
import ChefsPage from "@/pages/chefs";
import ChefProfilePage from "@/pages/chef-profile";
import BecomeChefPage from "@/pages/become-chef";
import BookingPage from "@/pages/booking";
import ChefOnboardingPage from "@/pages/chef-onboarding";
import DashboardRouter from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/chefs" component={ChefsPage} />
      <Route path="/chefs/:id" component={ChefProfilePage} />
      <Route path="/become-chef" component={BecomeChefPage} />
      <Route path="/book/:id" component={BookingPage} />
      <Route path="/chef/onboarding" component={ChefOnboardingPage} />
      <Route path="/dashboard" component={DashboardRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

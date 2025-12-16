import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  ChefHat, 
  DollarSign, 
  Calendar, 
  Users, 
  Shield, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Set Your Own Rates",
    description: "You're in control. Set competitive hourly rates and minimum spend requirements that reflect your expertise.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Accept bookings when it works for you. Manage your availability and never miss an opportunity.",
  },
  {
    icon: Users,
    title: "Grow Your Clientele",
    description: "Access a network of customers seeking premium private dining experiences in your area.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid reliably with our secure payment system. Funds are held and released after each event.",
  },
  {
    icon: TrendingUp,
    title: "Build Your Reputation",
    description: "Collect reviews and ratings to build trust and attract more bookings over time.",
  },
  {
    icon: CheckCircle,
    title: "Simple Onboarding",
    description: "Quick verification process to get you started. Upload your documents and start accepting bookings.",
  },
];

const steps = [
  { step: "1", title: "Create Your Profile", description: "Sign up and tell us about your culinary background and specialties." },
  { step: "2", title: "Get Verified", description: "Complete our verification process to build trust with customers." },
  { step: "3", title: "Set Your Availability", description: "Configure your calendar and pricing preferences." },
  { step: "4", title: "Start Accepting Bookings", description: "Review requests and create unforgettable dining experiences." },
];

export default function BecomeChefPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-foreground mb-6">
              Share Your Culinary Passion
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join Dine Maison and connect with customers seeking exceptional private dining experiences. 
              Set your own rates, manage your schedule, and grow your business.
            </p>
            
            {isAuthenticated ? (
              <Button size="lg" asChild className="text-base px-8" data-testid="button-apply-chef">
                <Link href="/chef/onboarding">
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="text-base px-8" data-testid="button-login-chef">
                <a href="/api/login">
                  Sign In to Apply
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </section>

        <section className="py-20 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-medium text-foreground mb-4">
                Why Join Dine Maison?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide the platform, you provide the culinary magic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-medium text-foreground mb-4">
                How to Get Started
              </h2>
              <p className="text-lg text-muted-foreground">
                Four simple steps to begin your journey with Dine Maison.
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              {isAuthenticated ? (
                <Button size="lg" asChild className="text-base px-8" data-testid="button-apply-chef-bottom">
                  <Link href="/chef/onboarding">
                    Start Your Application
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="text-base px-8" data-testid="button-login-chef-bottom">
                  <a href="/api/login">
                    Sign In to Apply
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/loading";
import { ChefHat, ArrowRight, Sparkles, Mail, Lock } from "lucide-react";
import logoImage from "@assets/dinemaison-logo.png";
import { mediaUrls } from "@/config/media";
import { queryClient } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: Send and receive cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login failed");
        return;
      }

      if (!result.user) {
        console.error("Login succeeded but no user data returned:", result);
        setError("Login failed: No user data received");
        return;
      }

      // Set user data in cache immediately to avoid race condition
      queryClient.setQueryData(["/api/auth/user"], result.user);
      console.log("User data cached, navigating to dashboard:", result.user);

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      setLocation("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Video/Image Background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={mediaUrls.login.poster}
        >
          <source src={mediaUrls.login.video} type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />
        
        {/* Animated elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button onClick={() => setLocation("/")} className="flex flex-col items-start gap-1 group">
              <img src={logoImage} alt="Dine Maison" className="h-20 lg:h-24 w-auto brightness-0 invert" />
              <div className="flex flex-col items-start -mt-5 lg:-mt-6">
                <span className="text-[9px] lg:text-[10px] tracking-[0.25em] uppercase text-white/70">
                  The Art of
                </span>
                <span className="text-[9px] lg:text-[10px] tracking-[0.25em] uppercase text-white/70">
                  Intimate Dining
                </span>
              </div>
            </button>
          </motion.div>
          
          {/* Main content */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-serif text-4xl xl:text-5xl font-medium leading-tight">
                Welcome back to<br />
                <span className="text-primary">culinary excellence</span>
              </h1>
            </motion.div>
            <motion.p 
              className="text-lg text-white/80 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Access your account to manage bookings, connect with chefs, and create unforgettable dining experiences.
            </motion.p>
            
            {/* Stats */}
            <motion.div 
              className="flex gap-8 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-white/60">Expert Chefs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-white/60">Events Hosted</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-white/60">Avg Rating</div>
              </div>
            </motion.div>
          </div>
          
          {/* Bottom quote */}
          <motion.div 
            className="flex items-center gap-3 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm italic">"The art of intimate dining, delivered to your door."</span>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-background">
        <motion.div 
          className="w-full max-w-md space-y-6 md:space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo - Centered PWA Style */}
          <div className="md:hidden flex flex-col items-center justify-center">
            <button onClick={() => setLocation("/")} className="flex flex-col items-center gap-1">
              <img src={logoImage} alt="Dine Maison" className="h-20 w-auto dark:brightness-0 dark:invert" />
              <div className="flex flex-col items-center -mt-5">
                <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                  The Art of
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                  Intimate Dining
                </span>
              </div>
            </button>
          </div>

          {/* Header - Centered on Mobile */}
          <div className="text-center">
            <motion.h2 
              className="text-2xl md:text-3xl font-semibold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Welcome back
            </motion.h2>
            <motion.p 
              className="mt-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Sign in to manage your platform
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-2"
            >
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-12 h-14 text-base rounded-2xl bg-muted/50 border-0 focus-visible:ring-2"
                  autoFocus
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setLocation("/forgot-password")}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Forgot?
                </button>
              </div>
              <EnhancedInput
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-14 text-base rounded-2xl bg-muted/50 border-0 focus-visible:ring-2"
                error={form.formState.errors.password?.message}
                {...form.register("password")}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="pt-2"
            >
              <Button 
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" className="text-white" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>

            {/* Alternative sign-in option */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="text-center"
            >
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a code instead
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div 
            className="space-y-3 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setLocation("/signup")}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign up
              </button>
            </div>
            <div className="text-center md:hidden">
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}


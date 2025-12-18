import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, CheckCircle2, ArrowRight, Lock, AlertCircle } from "lucide-react";
import logoImage from "@assets/dinemaison-logo.png";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, params] = useRoute("/reset-password/:token");
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!params?.token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Reset failed");
        return;
      }

      setSuccess(true);
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password.",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => setLocation("/login"), 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (!params?.token) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=1080&fit=crop)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />
          
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
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
            <div />
            <div />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
          <motion.div 
            className="w-full max-w-md space-y-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-serif font-medium text-foreground">Invalid Reset Link</h2>
              <p className="mt-3 text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <Button onClick={() => setLocation("/forgot-password")} className="w-full h-12 text-base">
              Request new reset link
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=1080&fit=crop)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />
          
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
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
            
            <div className="space-y-6">
              <h1 className="font-serif text-4xl xl:text-5xl font-medium leading-tight">
                Password<br />
                <span className="text-primary">reset!</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Your password has been successfully updated.
              </p>
            </div>
            
            <div />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
          <motion.div 
            className="w-full max-w-md space-y-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-serif font-medium text-foreground">Password reset!</h2>
              <p className="mt-3 text-muted-foreground">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>

            <Button onClick={() => setLocation("/login")} className="w-full h-12 text-base">
              Go to login
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=1080&fit=crop)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />
        
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
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
          
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-serif text-4xl xl:text-5xl font-medium leading-tight">
              Create a new<br />
              <span className="text-primary">password</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Choose a strong password to keep your account secure.
            </p>
          </motion.div>
          
          <div />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div 
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center justify-center gap-2">
            <button onClick={() => setLocation("/")} className="flex flex-col items-center gap-1">
              <img src={logoImage} alt="Dine Maison" className="h-16 sm:h-20 w-auto dark:brightness-0 dark:invert" />
              <div className="flex flex-col items-center -mt-4 sm:-mt-5">
                <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-foreground/70">
                  The Art of
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-foreground/70">
                  Intimate Dining
                </span>
              </div>
            </button>
          </div>

          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-serif font-medium text-foreground">Reset your password</h2>
            <p className="mt-2 text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="h-12 bg-muted/50 border-border/50 focus:border-primary transition-colors"
                {...form.register("newPassword")}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-12 bg-muted/50 border-border/50 focus:border-primary transition-colors"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium group" disabled={isLoading}>
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Reset password
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


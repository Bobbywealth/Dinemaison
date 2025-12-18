import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, ArrowLeft, Mail, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Request failed");
        return;
      }

      setSuccess(true);
      toast({
        title: "Check your email",
        description: "If an account exists, you'll receive a password reset link.",
      });
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel - Image Background */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=1080&fit=crop)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />
          
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <button onClick={() => setLocation("/")} className="cursor-pointer">
              <Logo 
                variant="default"
                textColor="text-white"
              />
            </button>
            
            <div className="space-y-6">
              <h1 className="font-serif text-4xl xl:text-5xl font-medium leading-tight">
                Check your<br />
                <span className="text-primary">inbox</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                We've sent you an email with instructions to reset your password.
              </p>
            </div>
            
            <div />
          </div>
        </div>

        {/* Right Panel - Success Message */}
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
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-serif font-medium text-foreground">Check your email</h2>
              <p className="mt-3 text-muted-foreground">
                If an account exists with that email, we've sent you a link to reset your password.
              </p>
            </div>

            <Alert className="text-left">
              <AlertDescription>
                The reset link will expire in 1 hour. If you don't see the email, check your spam folder.
              </AlertDescription>
            </Alert>

            <Button onClick={() => setLocation("/login")} className="w-full h-12 text-base">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to login
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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
            <button onClick={() => setLocation("/")} className="cursor-pointer">
              <Logo 
                variant="default"
                textColor="text-white"
              />
            </button>
          </motion.div>
          
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-serif text-4xl xl:text-5xl font-medium leading-tight">
              Forgot your<br />
              <span className="text-primary">password?</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              No worries! Enter your email and we'll send you a link to reset your password.
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
          <div className="lg:hidden flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif font-medium text-foreground">Reset password</h2>
            <p className="mt-2 text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
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
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="chef@dinemaison.com"
                className="h-12 bg-muted/50 border-border/50 focus:border-primary transition-colors"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
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
                  Send reset link
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


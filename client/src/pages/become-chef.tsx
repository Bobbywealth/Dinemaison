import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  ChefHat, 
  DollarSign, 
  Calendar, 
  Users, 
  Shield, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Play
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Set Your Own Rates",
    description: "You're in control. Set competitive hourly rates and minimum spend requirements that reflect your expertise.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Accept bookings when it works for you. Manage your availability and never miss an opportunity.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop",
  },
  {
    icon: Users,
    title: "Grow Your Clientele",
    description: "Access a network of customers seeking premium private dining experiences in your area.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid reliably with our secure payment system. Funds are held and released after each event.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
  },
  {
    icon: TrendingUp,
    title: "Build Your Reputation",
    description: "Collect reviews and ratings to build trust and attract more bookings over time.",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=300&fit=crop",
  },
  {
    icon: CheckCircle,
    title: "Simple Onboarding",
    description: "Quick verification process to get you started. Upload your documents and start accepting bookings.",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=300&fit=crop",
  },
];

const steps = [
  { 
    step: "1", 
    title: "Create Your Profile", 
    description: "Sign up and tell us about your culinary background and specialties.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300&h=200&fit=crop"
  },
  { 
    step: "2", 
    title: "Get Verified", 
    description: "Complete our verification process to build trust with customers.",
    image: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=300&h=200&fit=crop"
  },
  { 
    step: "3", 
    title: "Set Your Availability", 
    description: "Configure your calendar and pricing preferences.",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=300&h=200&fit=crop"
  },
  { 
    step: "4", 
    title: "Start Accepting Bookings", 
    description: "Review requests and create unforgettable dining experiences.",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function BecomeChefPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: chefProfile, isLoading: chefLoading } = useQuery({
    queryKey: ["/api/chef/profile"],
    enabled: isAuthenticated,
  });

  const createProfile = useMutation({
    mutationFn: async () => {
      const payload = {
        displayName: `${user?.firstName || "Chef"} ${user?.lastName || ""}`.trim() || "Chef Partner",
        bio:
          "Private chef specializing in intimate dining experiences. Available for bespoke menus, tasting menus, and elevated dinner parties.",
        yearsExperience: 5,
        cuisines: ["Modern American", "Mediterranean", "Italian"],
        dietarySpecialties: ["Gluten-Free", "Vegetarian"],
        servicesOffered: ["Private Dinner", "Tasting Menu", "Event Catering"],
        hourlyRate: "150",
        minimumSpend: "350",
        minimumGuests: 2,
        maximumGuests: 12,
        verificationLevel: "basic",
        isCertified: false,
        isActive: true,
        commissionRate: "15",
      };

      const res = await fetch("/api/chef/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to create chef profile");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Chef profile created",
        description: "You can now finish onboarding and set up payments.",
      });
      window.location.href = "/chef/onboarding";
    },
    onError: (err: any) => {
      toast({
        title: "Could not create profile",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section with Video */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&h=1080&fit=crop"
            >
              <source src="https://videos.pexels.com/video-files/3298210/3298210-uhd_2560_1440_30fps.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
          </div>

          {/* Animated elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChefHat className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white">Join 500+ Professional Chefs</span>
            </motion.div>
            
            <motion.h1 
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Share Your{" "}
              <span className="text-primary">Culinary Passion</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Join Dine Maison and connect with customers seeking exceptional private dining experiences. 
              Set your own rates, manage your schedule, and grow your business.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <motion.div className="flex flex-col sm:flex-row gap-3" whileHover={{ scale: 1.01 }}>
                  <Button
                    size="lg"
                    className="text-base px-10 py-6 shadow-lg shadow-primary/25"
                    data-testid="button-apply-chef"
                    disabled={createProfile.isPending || chefLoading}
                    onClick={() => {
                      if (chefProfile) {
                        window.location.href = "/chef/onboarding";
                        return;
                      }
                      createProfile.mutate();
                    }}
                  >
                    {createProfile.isPending
                      ? "Preparing your profile..."
                      : chefProfile
                      ? "Continue Onboarding"
                      : "Start Your Application"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-base px-10 py-6 border-white/30 text-white hover:bg-white/10">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Video
                  </Button>
                </motion.div>
              ) : (
                <motion.div className="flex flex-col sm:flex-row gap-3" whileHover={{ scale: 1.01 }}>
                  <Button size="lg" asChild className="text-base px-10 py-6 shadow-lg shadow-primary/25" data-testid="button-login-chef">
                    <Link href="/signup">
                      Get Started Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-base px-10 py-6 border-white/30 text-white hover:bg-white/10">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Video
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {[
                { value: "$150+", label: "Avg Hourly Rate" },
                { value: "500+", label: "Active Chefs" },
                { value: "4.9★", label: "Chef Rating" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-card/50 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Benefits
              </motion.span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
                Why Join Dine Maison?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide the platform, you provide the culinary magic.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {benefits.map((benefit, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="group relative overflow-hidden border-border/50 h-full hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    {/* Background image on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <img src={benefit.image} alt={benefit.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/80" />
                    </div>

                    <CardContent className="relative p-6 z-10">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <benefit.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                      </motion.div>
                      <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Getting Started
              </motion.span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
                How to Get Started
              </h2>
              <p className="text-lg text-muted-foreground">
                Four simple steps to begin your journey with Dine Maison.
              </p>
            </motion.div>

            <div className="space-y-12">
              {steps.map((item, index) => (
                <motion.div 
                  key={index} 
                  className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Image */}
                  <motion.div 
                    className="w-full md:w-1/2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-xl">
                      <img src={item.image} alt={item.title} className="w-full h-64 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <motion.div 
                        className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 400, delay: 0.3 + index * 0.1 }}
                      >
                        {item.step}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="w-full md:w-1/2 text-center md:text-left">
                    <h3 className="font-semibold text-2xl text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" asChild className="text-base px-10 py-6" data-testid="button-apply-chef-bottom">
                    <Link href="/chef/onboarding">
                      Start Your Application
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" asChild className="text-base px-10 py-6" data-testid="button-login-chef-bottom">
                    <Link href="/signup">
                      Get Started Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

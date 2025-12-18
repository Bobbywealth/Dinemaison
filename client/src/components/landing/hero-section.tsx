import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Star, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background Video */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: imageY }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-[120%] object-cover scale-110"
        >
          <source src="https://nsfugatyzizzpefvlwbk.supabase.co/storage/v1/object/public/videos/Chefscooking.%202222.mp4" type="video/mp4" />
        </video>
      </motion.div>
      
      {/* Enhanced Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/40 to-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-primary/30 to-amber-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
            }}
            animate={{
              y: -100,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main Content with Parallax */}
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 z-10"
        style={{ y: contentY, opacity }}
      >
        <div className="text-center">
          {/* Premium Badge with shimmer effect */}
          <motion.div 
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/30 mb-8 shadow-lg shadow-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="h-4 w-4 text-primary fill-primary animate-pulse" />
            <span className="text-sm font-semibold text-white tracking-wide">Premium Private Chef Experiences</span>
            <Star className="h-4 w-4 text-primary fill-primary" />
          </motion.div>
          
          {/* Hero Title with Gradient Text */}
          <motion.h1 
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-white drop-shadow-2xl">The Art of </span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Intimate Dining
            </span>
          </motion.h1>
          
          {/* Subtitle with better contrast */}
          <motion.p 
            className="max-w-3xl mx-auto text-lg sm:text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Connect with world-class private chefs for unforgettable culinary experiences. 
            <br className="hidden md:block" />
            <span className="text-white/70">From intimate dinners to special celebrations, crafted with passion and served with grace.</span>
          </motion.p>
          
          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                asChild 
                className="text-base px-10 py-6 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 shadow-2xl shadow-primary/50 border-0 relative overflow-hidden group" 
                data-testid="button-browse-chefs-hero"
              >
                <Link href="/chefs">
                  <span className="relative z-10 flex items-center">
                    Browse Chefs
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-base px-10 py-6 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 shadow-xl" 
                data-testid="button-become-chef-hero"
              >
                <Link href="/become-chef">
                  Become a Chef
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 mt-16 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <span className="text-sm font-medium">500+ Five-Star Reviews</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">100+ Certified Chefs</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">20,000+ Dinners Served</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-white/40 text-xs uppercase tracking-wider">Scroll to explore</span>
          <ChevronRight className="h-6 w-6 text-white/60 rotate-90" />
        </motion.div>
      </motion.div>
    </section>
  );
}

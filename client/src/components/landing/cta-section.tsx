import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { mediaUrls } from "@/config/media";

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={mediaUrls.cta.poster}
        >
          <source src={mediaUrls.cta.video} type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      </div>

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <Sparkles className="h-4 w-4 text-primary/40" />
          </motion.div>
        ))}
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated icon */}
        <motion.div 
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm mb-8 border border-primary/30"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChefHat className="h-10 w-10 text-white" />
          </motion.div>
        </motion.div>
        
        <motion.h2 
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Ready to Create{" "}
          <span className="relative">
            <span className="relative z-10 text-primary">Unforgettable</span>
            <motion.span 
              className="absolute bottom-2 left-0 right-0 h-3 bg-primary/30 -z-0"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              style={{ transformOrigin: "left" }}
            />
          </span>
          <br className="hidden sm:block" />
          Moments?
        </motion.h2>
        
        <motion.p 
          className="text-lg sm:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Whether you're celebrating a special occasion or simply elevating your everyday dining, 
          our chefs are ready to craft an experience just for you.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              asChild 
              className="text-base px-10 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 group" 
              data-testid="button-book-experience"
            >
              <Link href="/chefs">
                Book Your Experience
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Link>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="text-base px-10 py-6 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm" 
              data-testid="button-learn-more"
            >
              <Link href="/become-chef">
                Become a Chef
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">500+</span>
            <span className="text-sm">Professional Chefs</span>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">10k+</span>
            <span className="text-sm">Events Hosted</span>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">4.9</span>
            <span className="text-sm">Average Rating</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

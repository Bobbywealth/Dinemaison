import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-8"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <ChefHat className="h-8 w-8 text-primary" />
        </motion.div>
        
        <motion.h2 
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Ready to Create <br className="hidden sm:block" />
          Unforgettable Moments?
        </motion.h2>
        
        <motion.p 
          className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Whether you're celebrating a special occasion or simply elevating your everyday dining, 
          our chefs are ready to craft an experience just for you.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button size="lg" asChild className="text-base px-8" data-testid="button-book-experience">
            <Link href="/chefs">
              Book Your Experience
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base px-8" data-testid="button-learn-more">
            <Link href="/how-it-works">
              Learn More
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

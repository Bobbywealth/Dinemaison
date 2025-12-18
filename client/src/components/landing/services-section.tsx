import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Wine, Cake, Users } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: UtensilsCrossed,
    title: "Private Dining Experiences",
    description: "Intimate multi-course dinners crafted by professional chefs in the comfort of your home or venue.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
  },
  {
    icon: Wine,
    title: "Wine & Cocktail Pairing",
    description: "Expert sommeliers and mixologists curate the perfect beverages to complement your meal.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
  },
  {
    icon: Cake,
    title: "Artisan Desserts",
    description: "Handcrafted sweet creations and dessert experiences that provide the perfect ending to your evening.",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop",
  },
  {
    icon: Users,
    title: "Event Styling & Staff",
    description: "Professional hospitality staff and elegant event styling to elevate your dining experience.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-20 bg-gradient-to-b from-card/30 via-card/50 to-background relative overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-primary/15 to-orange-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 text-primary text-sm font-semibold tracking-wider uppercase mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            What We Offer
          </motion.span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Our Premium
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Where culinary intimacy meets artistry. Each service reflects the art of intimate dining,
            <span className="text-foreground/70"> crafted with passion and served with grace.</span>
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {services.map((service, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card 
                className="group relative overflow-hidden transition-all duration-500 border-border/40 h-full hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/30 bg-transparent"
                data-testid={`card-service-${index}`}
              >
                {/* Always visible background image with elegant overlay */}
                <div className="absolute inset-0">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Multi-layer gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
                  <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-transparent to-primary/10" />
                  {/* Glassmorphism effect */}
                  <div className="absolute inset-0 backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all duration-500" />
                </div>

                {/* Shimmer effect on hover */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  initial={false}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/20" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 2,
                    }}
                  />
                </motion.div>

                {/* Inner glow border */}
                <div className="absolute inset-[1px] rounded-[11px] border border-white/5 group-hover:border-white/10 transition-colors pointer-events-none" />

                <CardContent className="relative p-8 z-10 flex flex-col h-full">
                  {/* Enhanced icon with glow effect */}
                  <motion.div 
                    className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-amber-500/15 to-orange-500/10 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:via-amber-500/25 group-hover:to-orange-500/20 transition-all duration-500 border border-primary/20 group-hover:border-primary/40"
                    whileHover={{ 
                      rotate: [0, -5, 5, 0],
                      scale: 1.1,
                    }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.5 }}
                  >
                    {/* Glowing background */}
                    <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/20 blur-xl transition-all duration-500" />
                    <service.icon className="relative h-8 w-8 text-primary group-hover:text-amber-400 transition-colors duration-300 drop-shadow-lg" />
                    
                    {/* Subtle pulse animation */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-primary/30"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                  
                  <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-amber-400 transition-all duration-300 drop-shadow-sm">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors flex-grow">
                    {service.description}
                  </p>
                  
                  {/* Elegant separator with shimmer */}
                  <div className="relative h-px mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                      initial={{ x: '-100%' }}
                      whileInView={{ x: '100%' }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: 0.5 + index * 0.15, 
                        duration: 1.5,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-0 group-hover:opacity-100"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1
                      }}
                    />
                  </div>
                  
                  {/* Enhanced hover indicator with better animation */}
                  <motion.div 
                    className="flex items-center text-primary group-hover:text-amber-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                  >
                    <span className="drop-shadow">Explore Service</span>
                    <motion.span 
                      className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 group-hover:bg-amber-400/20 border border-primary/20 group-hover:border-amber-400/40"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </CardContent>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

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
              whileHover={{ y: -8 }}
            >
              <Card 
                className="group relative overflow-hidden transition-all duration-500 border-border/50 h-full hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 bg-card/80 backdrop-blur-sm"
                data-testid={`card-service-${index}`}
              >
                {/* Gradient glow effect on hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />

                {/* Background image with overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <motion.img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/85" />
                </div>

                <CardContent className="relative p-8 z-10">
                  {/* Icon with animated background */}
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-amber-500/10 flex items-center justify-center mb-6 group-hover:from-primary group-hover:to-amber-600 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-primary/0 group-hover:shadow-primary/30"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.5 }}
                  >
                    <service.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                  </motion.div>
                  
                  <h3 className="font-bold text-xl text-foreground mb-3 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-amber-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 group-hover:text-foreground/70 transition-colors">
                    {service.description}
                  </p>
                  
                  {/* Animated separator */}
                  <motion.div 
                    className="h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent mb-4 group-hover:via-primary/50 transition-all duration-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  />
                  
                  {/* Enhanced hover indicator */}
                  <motion.div 
                    className="flex items-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ x: -10 }}
                    whileHover={{ x: 5 }}
                  >
                    <span>Explore Service</span>
                    <motion.span 
                      className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 group-hover:bg-primary/20"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

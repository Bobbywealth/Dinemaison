import { Search, Calendar, ChefHat, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse & Discover",
    description: "Explore our curated selection of professional chefs. Filter by cuisine, specialty, and location.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300&h=300&fit=crop",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book Your Experience",
    description: "Select your date, guest count, and customize your menu. Communicate directly with your chef.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&h=300&fit=crop",
  },
  {
    icon: ChefHat,
    step: "03",
    title: "Enjoy the Experience",
    description: "Your chef arrives with fresh ingredients and prepares an unforgettable meal in your space.",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=300&h=300&fit=crop",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Rate & Review",
    description: "Share your experience with the community and help others discover great chefs.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=300&fit=crop",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-background relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Simple Process
          </motion.span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Booking your private chef experience is simple and seamless.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {steps.map((item, index) => (
            <motion.div 
              key={index} 
              className="relative group" 
              data-testid={`step-${index + 1}`}
              variants={itemVariants}
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 overflow-hidden"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/50 to-primary/20"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                    style={{ transformOrigin: "left" }}
                  />
                  {/* Animated dot */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                    initial={{ left: "0%" }}
                    whileInView={{ left: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8 + index * 0.2, ease: "easeInOut" }}
                  />
                </motion.div>
              )}
              
              <div className="relative flex flex-col items-center text-center px-2">
                {/* Image circle behind icon */}
                <motion.div 
                  className="relative mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Background image circle */}
                  <motion.div 
                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors" />
                  </motion.div>
                  
                  {/* Icon overlay */}
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                  </motion.div>
                  
                  {/* Step number badge */}
                  <motion.span 
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg ring-2 ring-background"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.5 + index * 0.15 }}
                  >
                    {item.step}
                  </motion.span>
                </motion.div>
                
                <motion.h3 
                  className="font-semibold text-lg text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {item.title}
                </motion.h3>
                <motion.p 
                  className="text-sm text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {item.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

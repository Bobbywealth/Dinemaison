import { Search, Calendar, ChefHat, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse & Discover",
    description: "Explore our curated selection of professional chefs. Filter by cuisine, specialty, and location.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book Your Experience",
    description: "Select your date, guest count, and customize your menu. Communicate directly with your chef.",
  },
  {
    icon: ChefHat,
    step: "03",
    title: "Enjoy the Experience",
    description: "Your chef arrives with fresh ingredients and prepares an unforgettable meal in your space.",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Rate & Review",
    description: "Share your experience with the community and help others discover great chefs.",
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
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Booking your private chef experience is simple and seamless.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {steps.map((item, index) => (
            <motion.div 
              key={index} 
              className="relative" 
              data-testid={`step-${index + 1}`}
              variants={itemVariants}
            >
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-border"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  style={{ transformOrigin: "left" }}
                />
              )}
              <div className="relative flex flex-col items-center text-center">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                    whileHover={{ backgroundColor: "hsl(var(--primary) / 0.2)" }}
                  >
                    <item.icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <motion.span 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.3 + index * 0.15 }}
                  >
                    {item.step}
                  </motion.span>
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

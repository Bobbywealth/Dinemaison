import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Wine, Cake, Users } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: UtensilsCrossed,
    title: "Private Dining Experiences",
    description: "Intimate multi-course dinners crafted by professional chefs in the comfort of your home or venue.",
  },
  {
    icon: Wine,
    title: "Wine & Cocktail Pairing",
    description: "Expert sommeliers and mixologists curate the perfect beverages to complement your meal.",
  },
  {
    icon: Cake,
    title: "Artisan Desserts",
    description: "Handcrafted sweet creations and dessert experiences that provide the perfect ending to your evening.",
  },
  {
    icon: Users,
    title: "Event Styling & Staff",
    description: "Professional hospitality staff and elegant event styling to elevate your dining experience.",
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
    <section className="py-24 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where culinary intimacy meets artistry. Each service reflects the art of intimate dining.
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
            <motion.div key={index} variants={itemVariants}>
              <Card 
                className="group hover-elevate transition-all duration-300 border-border/50 h-full"
                data-testid={`card-service-${index}`}
              >
                <CardContent className="p-6">
                  <motion.div 
                    className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <service.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

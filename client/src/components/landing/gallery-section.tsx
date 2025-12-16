import { motion } from "framer-motion";
import chefImage1 from "@assets/stock_images/professional_chef_co_799a5867.jpg";
import chefImage2 from "@assets/stock_images/professional_chef_co_4a55398b.jpg";
import foodImage1 from "@assets/stock_images/gourmet_food_plating_d2094bd5.jpg";
import foodImage2 from "@assets/stock_images/gourmet_food_plating_4976e510.jpg";
import diningImage from "@assets/stock_images/luxury_private_dinin_b1c27f12.jpg";

const images = [
  { src: chefImage1, alt: "Professional chef at work", span: "col-span-1 row-span-2" },
  { src: foodImage1, alt: "Gourmet food plating", span: "col-span-1 row-span-1" },
  { src: diningImage, alt: "Luxury private dining", span: "col-span-1 row-span-1" },
  { src: foodImage2, alt: "Elegant dish presentation", span: "col-span-1 row-span-1" },
  { src: chefImage2, alt: "Chef preparing cuisine", span: "col-span-1 row-span-1" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function GallerySection() {
  return (
    <section className="py-24 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Moments of Culinary Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A glimpse into the artistry and elegance that defines every Dine Maison experience.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {images.map((image, index) => (
            <motion.div 
              key={index}
              className={`relative overflow-hidden rounded-md group ${index === 0 ? 'row-span-2' : ''}`}
              data-testid={`gallery-image-${index}`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ minHeight: index === 0 ? '400px' : '200px' }}
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className="absolute bottom-4 left-4 right-4"
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white text-sm font-medium">{image.alt}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

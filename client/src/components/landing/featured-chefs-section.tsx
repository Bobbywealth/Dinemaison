import { Button } from "@/components/ui/button";
import { ChefCard } from "@/components/chef/chef-card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ChefProfile } from "@shared/schema";

const featuredChefs: Partial<ChefProfile>[] = [
  {
    id: "1",
    displayName: "Chef Marcus Williams",
    profileImageUrl: "/placeholder-chef-1.jpg",
    cuisines: ["French", "Mediterranean"],
    hourlyRate: "150",
    averageRating: "4.9",
    totalReviews: 47,
    yearsExperience: 15,
    verificationLevel: "certified",
    isCertified: true,
    bio: "Classically trained in Paris with 15 years of fine dining experience.",
  },
  {
    id: "2",
    displayName: "Chef Sofia Chen",
    profileImageUrl: "/placeholder-chef-2.jpg",
    cuisines: ["Asian Fusion", "Japanese"],
    hourlyRate: "125",
    averageRating: "4.8",
    totalReviews: 32,
    yearsExperience: 10,
    verificationLevel: "verified",
    isCertified: false,
    bio: "Specializing in modern Asian cuisine with traditional techniques.",
  },
  {
    id: "3",
    displayName: "Chef Antonio Rossi",
    profileImageUrl: "/placeholder-chef-3.jpg",
    cuisines: ["Italian", "Farm-to-Table"],
    hourlyRate: "135",
    averageRating: "4.9",
    totalReviews: 58,
    yearsExperience: 12,
    verificationLevel: "certified",
    isCertified: true,
    bio: "Bringing authentic Italian flavors with locally sourced ingredients.",
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
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export function FeaturedChefsSection() {
  return (
    <section className="py-24 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-2">
              Featured Chefs
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover our most sought-after culinary artists.
            </p>
          </div>
          <Button variant="outline" asChild data-testid="button-view-all-chefs">
            <Link href="/chefs">
              View All Chefs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {featuredChefs.map((chef) => (
            <motion.div key={chef.id} variants={itemVariants}>
              <ChefCard chef={chef as ChefProfile} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

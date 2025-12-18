import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChefCard } from "@/components/chef/chef-card";
import { ChefFilters, type FilterState } from "@/components/chef/chef-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { ChefProfile } from "@shared/schema";
import { ChefHat, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ChefsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    cuisine: "",
    priceRange: [0, 500],
    minRating: 0,
    dietary: [],
    market: "",
  });

  const { data: chefs, isLoading } = useQuery<ChefProfile[]>({
    queryKey: ["/api/chefs", filters],
    queryFn: async () => {
      // Build query parameters from filters
      const params = new URLSearchParams();
      
      if (filters.search) params.append("search", filters.search);
      if (filters.cuisine && filters.cuisine !== "all") params.append("cuisine", filters.cuisine);
      if (filters.market && filters.market !== "all") params.append("market", filters.market);
      if (filters.minRating > 0) params.append("minRating", filters.minRating.toString());
      if (filters.priceRange[0] > 0) params.append("minPrice", filters.priceRange[0].toString());
      if (filters.priceRange[1] < 500) params.append("maxPrice", filters.priceRange[1].toString());
      
      const queryString = params.toString();
      const url = `/api/chefs${queryString ? `?${queryString}` : ""}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Failed to fetch chefs: ${res.statusText}`);
      }
      return res.json();
    },
  });

  const filteredChefs = chefs || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Banner */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&h=600&fit=crop)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
          </div>

          {/* Animated elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">500+ Professional Chefs Available</span>
              </motion.div>
              
              <motion.h1 
                className="font-serif text-4xl sm:text-5xl font-medium text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Find Your Perfect{" "}
                <span className="text-primary">Private Chef</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-white/80 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Discover talented private chefs for your next culinary experience. Browse by cuisine, location, and availability.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ChefFilters onFilterChange={setFilters} />
            </motion.div>

            {/* Results count */}
            {!isLoading && (
              <motion.div 
                className="mb-6 flex items-center gap-2 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Search className="h-4 w-4" />
                <span>{filteredChefs.length} chef{filteredChefs.length !== 1 ? 's' : ''} found</span>
              </motion.div>
            )}

            {isLoading ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="space-y-4"
                    variants={itemVariants}
                  >
                    <Skeleton className="aspect-[4/3] rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : filteredChefs.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredChefs.map((chef, index) => (
                  <motion.div 
                    key={chef.id}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChefCard chef={chef} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center py-20 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <ChefHat className="h-12 w-12 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No chefs found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any chefs matching your criteria. Try adjusting your filters or check back later.
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChefCard } from "@/components/chef/chef-card";
import { ChefFilters, type FilterState } from "@/components/chef/chef-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { ChefProfile } from "@shared/schema";
import { ChefHat } from "lucide-react";

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
  });

  const filteredChefs = chefs || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-2">
              Browse Chefs
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover talented private chefs for your next culinary experience.
            </p>
          </div>

          <div className="mb-8">
            <ChefFilters onFilterChange={setFilters} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredChefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChefs.map((chef) => (
                <ChefCard key={chef.id} chef={chef} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <ChefHat className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No chefs found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any chefs matching your criteria. Try adjusting your filters or check back later.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

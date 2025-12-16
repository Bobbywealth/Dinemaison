import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

const cuisines = [
  "French",
  "Italian",
  "Japanese",
  "Asian Fusion",
  "Mediterranean",
  "American",
  "Mexican",
  "Indian",
  "Farm-to-Table",
  "Vegan",
];

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Kosher",
  "Halal",
];

interface ChefFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  cuisine: string;
  priceRange: [number, number];
  minRating: number;
  dietary: string[];
  market: string;
}

export function ChefFilters({ onFilterChange }: ChefFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    cuisine: "",
    priceRange: [0, 500],
    minRating: 0,
    dietary: [],
    market: "",
  });

  const [sheetOpen, setSheetOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleDietary = (option: string) => {
    const newDietary = filters.dietary.includes(option)
      ? filters.dietary.filter((d) => d !== option)
      : [...filters.dietary, option];
    updateFilter("dietary", newDietary);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: "",
      cuisine: "",
      priceRange: [0, 500],
      minRating: 0,
      dietary: [],
      market: "",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = [
    filters.cuisine,
    filters.minRating > 0,
    filters.dietary.length > 0,
    filters.market,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 500,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chefs by name or cuisine..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
            data-testid="input-search-chefs"
          />
        </div>

        <Select value={filters.market} onValueChange={(value) => updateFilter("market", value)}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-market">
            <SelectValue placeholder="All Markets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="ny-nj">NY / NJ</SelectItem>
            <SelectItem value="tampa-bay">Tampa Bay</SelectItem>
          </SelectContent>
        </Select>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative" data-testid="button-filters">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Chefs</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect chef.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="space-y-3">
                <Label>Cuisine Type</Label>
                <Select value={filters.cuisine} onValueChange={(value) => updateFilter("cuisine", value)}>
                  <SelectTrigger data-testid="select-cuisine">
                    <SelectValue placeholder="All Cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cuisines</SelectItem>
                    {cuisines.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Price Range (per hour)</Label>
                <div className="pt-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
                    min={0}
                    max={500}
                    step={25}
                    data-testid="slider-price-range"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}+</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Minimum Rating</Label>
                <Select
                  value={String(filters.minRating)}
                  onValueChange={(value) => updateFilter("minRating", Number(value))}
                >
                  <SelectTrigger data-testid="select-rating">
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.8">4.8+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Dietary Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={filters.dietary.includes(option) ? "default" : "outline"}
                      className="cursor-pointer toggle-elevate"
                      onClick={() => toggleDietary(option)}
                      data-testid={`badge-dietary-${option.toLowerCase()}`}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={clearFilters} className="flex-1" data-testid="button-clear-filters">
                  Clear All
                </Button>
                <Button onClick={() => setSheetOpen(false)} className="flex-1" data-testid="button-apply-filters">
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.cuisine && (
            <Badge variant="secondary" className="gap-1">
              {filters.cuisine}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("cuisine", "")} />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+ stars
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("minRating", 0)} />
            </Badge>
          )}
          {filters.dietary.map((d) => (
            <Badge key={d} variant="secondary" className="gap-1">
              {d}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleDietary(d)} />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

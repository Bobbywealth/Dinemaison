import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, X } from "lucide-react";

const CATEGORIES = [
  "Appetizer",
  "Main Course",
  "Side Dish",
  "Dessert",
  "Beverage",
  "Salad",
  "Soup",
  "Pasta",
  "Seafood",
  "Meat",
  "Vegetarian",
  "Vegan",
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Low-Carb",
  "Halal",
  "Kosher",
];

export default function AddMenuItem() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    prepTime: "",
    servingSize: "",
    imageUrl: "",
  });
  
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const createMenuItem = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/chef/menu", data);
    },
    onSuccess: () => {
      toast({ title: "Menu item added successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/chef/menu"] });
      navigate("/dashboard/chef#menu");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to add menu item", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name and category",
        variant: "destructive",
      });
      return;
    }

    createMenuItem.mutate({
      name: formData.name,
      description: formData.description || null,
      price: formData.price ? Math.round(parseFloat(formData.price) * 100).toString() : null,
      category: formData.category,
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : null,
      servingSize: formData.servingSize ? parseInt(formData.servingSize) : null,
      imageUrl: formData.imageUrl || null,
      dietaryInfo: selectedDietary.length > 0 ? selectedDietary : null,
      isAvailable: true,
    });
  };

  const handleDietaryToggle = (option: string) => {
    setSelectedDietary(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/chef#menu">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold">Add Menu Item</h1>
          <p className="text-muted-foreground mt-2">
            Create a new dish to showcase to your customers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Fill in the information about your menu item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Grilled Salmon with Asparagus"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your dish, ingredients, and preparation method..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="30"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input
                    id="servingSize"
                    type="number"
                    placeholder="2"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Add a URL to an image of your dish
                </p>
              </div>

              <div className="space-y-2">
                <Label>Dietary Information</Label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <Badge
                      key={option}
                      variant={selectedDietary.includes(option) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleDietaryToggle(option)}
                    >
                      {selectedDietary.includes(option) && (
                        <X className="mr-1 h-3 w-3" />
                      )}
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMenuItem.isPending}
                  className="flex-1"
                >
                  {createMenuItem.isPending ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Menu Item
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/chef#menu")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

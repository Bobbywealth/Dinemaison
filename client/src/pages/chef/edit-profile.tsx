import { useState, useEffect } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChefProfile } from "@shared/schema";
import { Header } from "@/components/layout/header";

const CUISINES = [
  "Italian",
  "French",
  "Japanese",
  "Chinese",
  "Mexican",
  "Indian",
  "Thai",
  "Spanish",
  "Greek",
  "Mediterranean",
  "American",
  "Korean",
  "Vietnamese",
  "Middle Eastern",
  "Fusion",
];

const DIETARY_SPECIALTIES = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
  "Low-Carb",
  "Sugar-Free",
];

const SERVICES = [
  "Private Dinners",
  "Meal Prep",
  "Cooking Classes",
  "Catering",
  "Wine Pairing",
  "Menu Planning",
  "Special Occasions",
  "Corporate Events",
  "Cocktail Parties",
];

export default function EditChefProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<ChefProfile>({
    queryKey: ["/api/chef/profile"],
  });

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    yearsExperience: "",
    profileImageUrl: "",
    coverImageUrl: "",
    hourlyRate: "",
    minimumSpend: "",
    minimumGuests: "",
    maximumGuests: "",
  });

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Populate form with existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        yearsExperience: profile.yearsExperience?.toString() || "",
        profileImageUrl: profile.profileImageUrl || "",
        coverImageUrl: profile.coverImageUrl || "",
        hourlyRate: profile.hourlyRate ? parseFloat(profile.hourlyRate).toFixed(2) : "",
        minimumSpend: profile.minimumSpend ? parseFloat(profile.minimumSpend).toFixed(2) : "",
        minimumGuests: profile.minimumGuests?.toString() || "2",
        maximumGuests: profile.maximumGuests?.toString() || "12",
      });
      setSelectedCuisines(profile.cuisines || []);
      setSelectedDietary(profile.dietarySpecialties || []);
      setSelectedServices(profile.servicesOffered || []);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/chef/profile", data);
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/chef/profile"] });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName) {
      toast({
        title: "Missing required fields",
        description: "Please provide a display name",
        variant: "destructive",
      });
      return;
    }

    updateProfile.mutate({
      displayName: formData.displayName,
      bio: formData.bio || null,
      yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
      profileImageUrl: formData.profileImageUrl || null,
      coverImageUrl: formData.coverImageUrl || null,
      hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
      minimumSpend: formData.minimumSpend ? parseFloat(formData.minimumSpend) : null,
      minimumGuests: formData.minimumGuests ? parseInt(formData.minimumGuests) : 2,
      maximumGuests: formData.maximumGuests ? parseInt(formData.maximumGuests) : 12,
      cuisines: selectedCuisines.length > 0 ? selectedCuisines : null,
      dietarySpecialties: selectedDietary.length > 0 ? selectedDietary : null,
      servicesOffered: selectedServices.length > 0 ? selectedServices : null,
    });
  };

  const handleArrayToggle = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void
  ) => {
    setSelected(
      selected.includes(item) ? selected.filter((i) => i !== item) : [...selected, item]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your chef profile information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Chef Marco Rossi"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell customers about your culinary background, specialties, and passion..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Images</CardTitle>
              <CardDescription>URLs for your profile and cover images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                <Input
                  id="profileImageUrl"
                  type="url"
                  placeholder="https://example.com/profile.jpg"
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <Input
                  id="coverImageUrl"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Capacity</CardTitle>
              <CardDescription>Set your rates and guest limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="150.00"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumSpend">Minimum Spend (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="minimumSpend"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="250.00"
                      value={formData.minimumSpend}
                      onChange={(e) => setFormData({ ...formData, minimumSpend: e.target.value })}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumGuests">Minimum Guests</Label>
                  <Input
                    id="minimumGuests"
                    type="number"
                    min="1"
                    placeholder="2"
                    value={formData.minimumGuests}
                    onChange={(e) => setFormData({ ...formData, minimumGuests: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximumGuests">Maximum Guests</Label>
                  <Input
                    id="maximumGuests"
                    type="number"
                    min="1"
                    placeholder="12"
                    value={formData.maximumGuests}
                    onChange={(e) => setFormData({ ...formData, maximumGuests: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cuisines */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisines</CardTitle>
              <CardDescription>Select all cuisines you specialize in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((cuisine) => (
                  <Badge
                    key={cuisine}
                    variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      handleArrayToggle(cuisine, selectedCuisines, setSelectedCuisines)
                    }
                  >
                    {selectedCuisines.includes(cuisine) && <X className="mr-1 h-3 w-3" />}
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dietary Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Dietary Specialties</CardTitle>
              <CardDescription>Dietary restrictions you can accommodate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DIETARY_SPECIALTIES.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={selectedDietary.includes(specialty) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      handleArrayToggle(specialty, selectedDietary, setSelectedDietary)
                    }
                  >
                    {selectedDietary.includes(specialty) && <X className="mr-1 h-3 w-3" />}
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>Types of services you provide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((service) => (
                  <Badge
                    key={service}
                    variant={selectedServices.includes(service) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      handleArrayToggle(service, selectedServices, setSelectedServices)
                    }
                  >
                    {selectedServices.includes(service) && <X className="mr-1 h-3 w-3" />}
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex-1 md:flex-none"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={updateProfile.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useParams, Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { useQuery } from "@tanstack/react-query";
import type { ChefProfile, Review } from "@shared/schema";
import { 
  ChefHat, 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  Award, 
  Calendar,
  Star,
  ArrowLeft
} from "lucide-react";

export default function ChefProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: chef, isLoading } = useQuery<ChefProfile>({
    queryKey: ["/api/chefs", id],
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/chefs", id, "reviews"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-80 w-full rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-60 w-full" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Chef Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The chef you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/chefs">Browse Chefs</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const rating = parseFloat(chef.averageRating || "0");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/chefs">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Chefs
            </span>
          </Link>

          <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden bg-muted mb-8">
            {chef.coverImageUrl ? (
              <img
                src={chef.coverImageUrl}
                alt={`${chef.displayName} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <ChefHat className="h-24 w-24 text-primary/30" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="h-32 w-32 border-4 border-background -mt-20 sm:-mt-24 relative z-10">
                  <AvatarImage src={chef.profileImageUrl || undefined} alt={chef.displayName} />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {chef.displayName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="font-serif text-2xl sm:text-3xl font-medium text-foreground">
                      {chef.displayName}
                    </h1>
                    {chef.isCertified && (
                      <Badge className="bg-primary">
                        <Award className="h-3 w-3 mr-1" />
                        Dine Maison Certified
                      </Badge>
                    )}
                    {chef.verificationLevel === "verified" && !chef.isCertified && (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={rating} showValue />
                      <span className="text-sm text-muted-foreground">
                        ({chef.totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(chef.cuisines || []).map((cuisine, index) => (
                      <Badge key={index} variant="outline">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-foreground mb-4">About</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {chef.bio || "This chef hasn't added a bio yet."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{chef.yearsExperience || 0}</p>
                      <p className="text-sm text-muted-foreground">Years Experience</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{chef.completedBookings || 0}</p>
                      <p className="text-sm text-muted-foreground">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{chef.minimumGuests || 2}-{chef.maximumGuests || 12}</p>
                      <p className="text-sm text-muted-foreground">Guests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">${parseFloat(chef.minimumSpend || "250")}</p>
                      <p className="text-sm text-muted-foreground">Min Spend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(chef.dietarySpecialties || []).length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-semibold text-foreground mb-4">Dietary Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {(chef.dietarySpecialties || []).map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(reviews || []).length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-semibold text-foreground mb-6">Reviews</h2>
                    <div className="space-y-6">
                      {(reviews || []).slice(0, 5).map((review) => (
                        <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-muted text-sm">
                                U
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">Guest</p>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground mt-2">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <span className="text-3xl font-semibold text-foreground">
                      ${parseFloat(chef.hourlyRate || "0").toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span>{chef.minimumGuests || 2}-{chef.maximumGuests || 12} guests</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span>Minimum ${parseFloat(chef.minimumSpend || "250")} spend</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" asChild data-testid="button-book-chef">
                    <Link href={`/book/${chef.id}`}>
                      <Calendar className="mr-2 h-5 w-5" />
                      Book This Chef
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    You won't be charged yet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

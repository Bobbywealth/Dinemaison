import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Star, Shield, Award, ChefHat } from "lucide-react";
import type { ChefProfile } from "@shared/schema";

interface ChefCardProps {
  chef: ChefProfile;
}

export function ChefCard({ chef }: ChefCardProps) {
  const getVerificationBadge = () => {
    if (chef.isCertified) {
      return (
        <Badge variant="default" className="bg-primary">
          <Award className="h-3 w-3 mr-1" />
          Certified
        </Badge>
      );
    }
    if (chef.verificationLevel === "verified") {
      return (
        <Badge variant="secondary">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return null;
  };

  const rating = parseFloat(chef.averageRating || "0");

  return (
    <Card 
      className="group overflow-visible hover-elevate transition-all duration-300 border-border/50"
      data-testid={`card-chef-${chef.id}`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-md bg-muted">
          {chef.profileImageUrl ? (
            <img
              src={chef.profileImageUrl}
              alt={chef.displayName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Replace broken image with placeholder
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-icon w-full h-full flex items-center justify-center bg-primary/10';
                  fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/40"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" x2="18" y1="17" y2="17"></line></svg>';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <ChefHat className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            {getVerificationBadge()}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground line-clamp-1">{chef.displayName}</h3>
            {rating > 0 && (
              <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({chef.totalReviews})</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {(chef.cuisines || []).slice(0, 3).map((cuisine, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {cuisine}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {chef.bio || "Professional private chef available for intimate dining experiences."}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold text-foreground">
                ${parseFloat(chef.hourlyRate || "0").toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">/hour</span>
            </div>
            <Button size="sm" asChild data-testid={`button-view-chef-${chef.id}`}>
              <Link href={`/chefs/${chef.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

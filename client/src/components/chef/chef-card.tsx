import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Star, Shield, Award, ChefHat, MapPin, Clock } from "lucide-react";
import type { ChefProfile } from "@shared/schema";
import { motion } from "framer-motion";
import { useState } from "react";

interface ChefCardProps {
  chef: ChefProfile;
}

export function ChefCard({ chef }: ChefCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getVerificationBadge = () => {
    if (chef.isCertified) {
      return (
        <Badge variant="default" className="bg-gradient-to-r from-primary to-amber-600 border-0 shadow-lg">
          <Award className="h-3 w-3 mr-1" />
          Certified
        </Badge>
      );
    }
    if (chef.verificationLevel === "verified") {
      return (
        <Badge variant="secondary" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return null;
  };

  const rating = parseFloat(chef.averageRating || "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="group overflow-hidden transition-all duration-500 border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm relative"
        data-testid={`card-chef-${chef.id}`}
      >
        {/* Glassmorphism overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          initial={false}
        />
        
        <CardContent className="p-0 relative">
        {/* Enhanced Image Section with Zoom Effect */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full"
          >
            {chef.profileImageUrl ? (
              <img
                src={chef.profileImageUrl}
                alt={chef.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Replace broken image with placeholder
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-icon w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-amber-500/10';
                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/40"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" x2="18" y1="17" y2="17"></line></svg>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-amber-500/10">
                <ChefHat className="h-20 w-20 text-primary/50" />
              </div>
            )}
          </motion.div>
          
          {/* Gradient overlay on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Verification Badge */}
          <div className="absolute top-3 right-3 z-20">
            {getVerificationBadge()}
          </div>

          {/* Quick View Overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              size="sm" 
              className="bg-white text-primary hover:bg-white/90 shadow-xl"
            >
              View Profile
            </Button>
          </motion.div>
        </div>

        {/* Enhanced Card Content */}
        <div className="p-5 space-y-4 relative z-20">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                {chef.displayName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Available Locally</span>
              </div>
            </div>
            
            {rating > 0 && (
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">({chef.totalReviews} reviews)</span>
              </div>
            )}
          </div>

          {/* Cuisine Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(chef.cuisines || []).slice(0, 3).map((cuisine, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-amber-500/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all"
              >
                {cuisine}
              </Badge>
            ))}
            {(chef.cuisines || []).length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-muted/50"
              >
                +{(chef.cuisines || []).length - 3} more
              </Badge>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {chef.bio || "Professional private chef available for intimate dining experiences."}
          </p>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Footer with Price and CTA */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground bg-gradient-to-br from-primary to-amber-600 bg-clip-text text-transparent">
                  ${parseFloat(chef.hourlyRate || "0").toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">/hour</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span>Flexible scheduling</span>
              </div>
            </div>
            
            <Button 
              size="sm" 
              asChild 
              className="bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 shadow-lg shadow-primary/25 border-0" 
              data-testid={`button-view-chef-${chef.id}`}
            >
              <Link href={`/chefs/${chef.id}`}>
                <span className="relative z-10">View Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

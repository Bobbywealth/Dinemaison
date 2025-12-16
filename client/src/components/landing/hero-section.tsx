import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Star } from "lucide-react";
import heroVideo from "@assets/generated_videos/luxury_private_dining_ambiance.mp4";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-white">Premium Private Chef Experiences</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white mb-6">
            The Art of{" "}
            <span className="text-primary">Intimate Dining</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/80 mb-10">
            Connect with world-class private chefs for unforgettable culinary experiences. 
            From intimate dinners to special celebrations, crafted with passion and served with grace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-base px-8" data-testid="button-browse-chefs-hero">
              <Link href="/chefs">
                Browse Chefs
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white" data-testid="button-become-chef-hero">
              <Link href="/become-chef">
                Become a Chef
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="animate-bounce">
          <ChevronRight className="h-6 w-6 text-white/60 rotate-90" />
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-8">
          <ChefHat className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-6">
          Ready to Create <br className="hidden sm:block" />
          Unforgettable Moments?
        </h2>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Whether you're celebrating a special occasion or simply elevating your everyday dining, 
          our chefs are ready to craft an experience just for you.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="text-base px-8" data-testid="button-book-experience">
            <Link href="/chefs">
              Book Your Experience
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base px-8" data-testid="button-learn-more">
            <Link href="/how-it-works">
              Learn More
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

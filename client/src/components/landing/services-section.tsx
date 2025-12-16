import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Wine, Cake, Users } from "lucide-react";

const services = [
  {
    icon: UtensilsCrossed,
    title: "Private Dining Experiences",
    description: "Intimate multi-course dinners crafted by professional chefs in the comfort of your home or venue.",
  },
  {
    icon: Wine,
    title: "Wine & Cocktail Pairing",
    description: "Expert sommeliers and mixologists curate the perfect beverages to complement your meal.",
  },
  {
    icon: Cake,
    title: "Artisan Desserts",
    description: "Handcrafted sweet creations and dessert experiences that provide the perfect ending to your evening.",
  },
  {
    icon: Users,
    title: "Event Styling & Staff",
    description: "Professional hospitality staff and elegant event styling to elevate your dining experience.",
  },
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where culinary intimacy meets artistry. Each service reflects the art of intimate dining.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover-elevate transition-all duration-300 border-border/50"
              data-testid={`card-service-${index}`}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

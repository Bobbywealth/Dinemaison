import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "New York, NY",
    avatar: "",
    rating: 5,
    text: "An absolutely incredible experience. Chef Marcus created a 7-course tasting menu for our anniversary that rivaled any Michelin-starred restaurant. The attention to detail was remarkable.",
  },
  {
    name: "David Chen",
    location: "Tampa, FL",
    avatar: "",
    rating: 5,
    text: "We've used Dine Maison for multiple corporate events. The professionalism and quality of the chefs is consistently outstanding. Our clients are always impressed.",
  },
  {
    name: "Emily Rodriguez",
    location: "Jersey City, NJ",
    avatar: "",
    rating: 5,
    text: "Chef Sofia made our dinner party unforgettable. Her Asian fusion menu was creative and delicious. The whole process from booking to cleanup was seamless.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            What Our Guests Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from our valued guests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50" data-testid={`testimonial-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

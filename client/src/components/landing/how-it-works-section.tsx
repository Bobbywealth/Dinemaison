import { Search, Calendar, ChefHat, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse & Discover",
    description: "Explore our curated selection of professional chefs. Filter by cuisine, specialty, and location.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book Your Experience",
    description: "Select your date, guest count, and customize your menu. Communicate directly with your chef.",
  },
  {
    icon: ChefHat,
    step: "03",
    title: "Enjoy the Experience",
    description: "Your chef arrives with fresh ingredients and prepares an unforgettable meal in your space.",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Rate & Review",
    description: "Share your experience with the community and help others discover great chefs.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Booking your private chef experience is simple and seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative" data-testid={`step-${index + 1}`}>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-border" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, Heart, Shield, Users, Award, TrendingUp, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Bringing Restaurant-Quality
              <span className="text-primary"> Dining to Your Home</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Dine Maison connects food enthusiasts with talented private chefs for unforgettable
              culinary experiences in the comfort of your own home.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/chefs">
                  Find a Chef
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/become-chef">
                  Become a Chef
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                At Dine Maison, we believe that extraordinary culinary experiences shouldn't be
                limited to restaurant settings. Our mission is to democratize fine dining by
                connecting passionate home cooks and event hosts with professional private chefs.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Whether you're celebrating a special occasion, hosting a dinner party, or simply
                want to enjoy restaurant-quality meals at home, we make it effortless to book
                exceptional culinary talent.
              </p>
              <p className="text-lg text-muted-foreground">
                For chefs, we provide a platform to showcase their skills, build their brand, and
                create meaningful connections with food enthusiasts while enjoying the flexibility
                of independent work.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">1000+</div>
                  <div className="text-muted-foreground">Happy Customers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <ChefHat className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">150+</div>
                  <div className="text-muted-foreground">Verified Chefs</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">4.9/5</div>
                  <div className="text-muted-foreground">Average Rating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">5000+</div>
                  <div className="text-muted-foreground">Bookings Completed</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Passion for Food</h3>
                <p className="text-muted-foreground">
                  We celebrate culinary artistry and the joy of sharing exceptional meals with
                  loved ones. Every booking is an opportunity to create lasting memories.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Trust & Safety</h3>
                <p className="text-muted-foreground">
                  All chefs undergo thorough verification, including background checks and
                  credential verification. Your safety and satisfaction are our top priorities.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Community First</h3>
                <p className="text-muted-foreground">
                  We're building a community of food lovers and culinary professionals who share
                  our passion for exceptional dining experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-muted-foreground">
              Dine Maison was born from a simple observation: while food delivery and restaurant
              reservations had become seamlessly digital, hiring a private chef remained
              surprisingly difficult and opaque.
            </p>
            <p className="text-muted-foreground">
              Our founders, a chef and a tech entrepreneur, experienced this firsthand when trying
              to organize a milestone birthday dinner. After weeks of cold emails, unreturned
              calls, and unclear pricing, they realized there had to be a better way.
            </p>
            <p className="text-muted-foreground">
              That realization became Dine Maison—a platform designed to make exceptional private
              dining accessible to everyone. We've built a marketplace where customers can easily
              discover, compare, and book talented chefs, while chefs gain access to a steady
              stream of bookings without the overhead of traditional marketing.
            </p>
            <p className="text-muted-foreground">
              Today, we're proud to serve thousands of customers and support hundreds of culinary
              professionals across the country. But we're just getting started. Our vision is to
              become the go-to platform for private culinary experiences worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Leadership Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet the people behind Dine Maison
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alexandra Chen",
                role: "Co-Founder & CEO",
                bio: "Former tech executive with a passion for transforming the culinary industry.",
              },
              {
                name: "Marco Dubois",
                role: "Co-Founder & CPO",
                bio: "Michelin-trained chef turned product leader, bringing culinary expertise to tech.",
              },
              {
                name: "Sarah Martinez",
                role: "Head of Community",
                bio: "Building trust and connections between chefs and customers since day one.",
              },
            ].map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="h-32 w-32 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of customers and chefs experiencing the future of private dining
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/chefs">
                Browse Chefs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/become-chef">Apply as a Chef</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChefProfile } from "@shared/schema";
import { 
  ChefHat, 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon,
  Users,
  Clock,
  MapPin,
  CreditCard,
  Check
} from "lucide-react";
import { format, addDays } from "date-fns";

const services = [
  { id: "dining", name: "Private Dining Experience", description: "Multi-course meal prepared in your space", included: true },
  { id: "wine", name: "Wine Pairing", description: "Expert wine selection to complement your meal", price: 75 },
  { id: "cocktails", name: "Cocktail Service", description: "Custom cocktails before and during dinner", price: 100 },
  { id: "dessert", name: "Artisan Dessert", description: "Handcrafted dessert experience", price: 50 },
];

const timeSlots = [
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
];

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [guestCount, setGuestCount] = useState(4);
  const [selectedServices, setSelectedServices] = useState<string[]>(["dining"]);
  const [address, setAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const { data: chef, isLoading } = useQuery<ChefProfile>({
    queryKey: ["/api/chefs", id],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Sent!",
        description: "The chef will review and respond to your request soon.",
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 lg:col-span-2" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 pb-16">
          <div className="max-w-md mx-auto px-4 text-center py-20">
            <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to book a chef experience.
            </p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 pb-16">
          <div className="max-w-md mx-auto px-4 text-center py-20">
            <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Chef Not Found</h1>
            <Button asChild>
              <Link href="/chefs">Browse Chefs</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hourlyRate = parseFloat(chef.hourlyRate || "0");
  const minimumSpend = parseFloat(chef.minimumSpend || "250");
  const estimatedHours = 3;
  const basePrice = Math.max(hourlyRate * estimatedHours, minimumSpend);
  const addOnTotal = selectedServices
    .filter(s => s !== "dining")
    .reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
  const subtotal = basePrice + addOnTotal;
  const serviceFee = subtotal * 0.08;
  const total = subtotal + serviceFee;

  const toggleService = (serviceId: string) => {
    if (serviceId === "dining") return;
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedDate && selectedTime;
      case 2: return guestCount >= (chef.minimumGuests || 2) && guestCount <= (chef.maximumGuests || 12);
      case 3: return address.length > 10;
      default: return true;
    }
  };

  const handleSubmit = () => {
    bookingMutation.mutate({
      chefId: chef.id,
      eventDate: selectedDate?.toISOString(),
      eventTime: selectedTime,
      guestCount,
      eventAddress: address,
      specialRequests,
      services: selectedServices,
      subtotal: subtotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      total: total.toFixed(2),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-36 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/chefs/${chef.id}`}>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to {chef.displayName}
            </span>
          </Link>

          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-8">
            Book Your Experience
          </h1>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      Select Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="mb-3 block">Choose a date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < addDays(new Date(), 2)}
                        className="rounded-md border"
                        data-testid="calendar-date"
                      />
                    </div>
                    
                    {selectedDate && (
                      <div>
                        <Label className="mb-3 block">Choose a time</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              data-testid={`button-time-${time.replace(/\s/g, "-")}`}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Guest Count & Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="guests" className="mb-2 block">Number of Guests</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuestCount(Math.max(chef.minimumGuests || 2, guestCount - 1))}
                          data-testid="button-decrease-guests"
                        >
                          -
                        </Button>
                        <span className="text-2xl font-semibold w-12 text-center">{guestCount}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuestCount(Math.min(chef.maximumGuests || 12, guestCount + 1))}
                          data-testid="button-increase-guests"
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {chef.minimumGuests || 2} - {chef.maximumGuests || 12} guests allowed
                      </p>
                    </div>

                    <div>
                      <Label className="mb-3 block">Services</Label>
                      <div className="space-y-3">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                              selectedServices.includes(service.id) ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <Checkbox
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={() => toggleService(service.id)}
                              disabled={service.included}
                              data-testid={`checkbox-service-${service.id}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-foreground">{service.name}</p>
                                {service.included ? (
                                  <Badge variant="secondary">Included</Badge>
                                ) : (
                                  <span className="font-medium text-foreground">+${service.price}</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="address">Event Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter the full address where the chef will prepare your meal"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-2"
                        data-testid="textarea-address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="requests">Special Requests (Optional)</Label>
                      <Textarea
                        id="requests"
                        placeholder="Allergies, dietary restrictions, special occasions, or any other preferences"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="mt-2"
                        data-testid="textarea-requests"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Review & Confirm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Guests</span>
                        <span className="font-medium">{guestCount}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium text-right max-w-xs">{address}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Services</span>
                        <div className="text-right">
                          {selectedServices.map(s => (
                            <Badge key={s} variant="outline" className="ml-1">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-md p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base Price (~{estimatedHours} hours)</span>
                        <span>${basePrice.toFixed(2)}</span>
                      </div>
                      {addOnTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Add-ons</span>
                          <span>${addOnTotal.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Service Fee</span>
                        <span>${serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      By confirming, you agree to our terms of service and cancellation policy. 
                      The chef will review your request and respond within 24 hours.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} data-testid="button-back">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button 
                    onClick={() => setStep(step + 1)} 
                    disabled={!canProceed()}
                    className="ml-auto"
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={bookingMutation.isPending}
                    className="ml-auto"
                    data-testid="button-confirm-booking"
                  >
                    {bookingMutation.isPending ? "Submitting..." : "Confirm Booking"}
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{chef.displayName}</p>
                      <p className="text-sm text-muted-foreground">${hourlyRate}/hour</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
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

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
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChefHat, 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon,
  Users,
  Clock,
  MapPin,
  CreditCard,
  Check,
  Sparkles
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Book Your <span className="text-gradient-luxury">Experience</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Complete the steps below to create your perfect dining experience
            </p>
          </motion.div>

          {/* Enhanced Progress Steps */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex justify-between items-center relative">
              {/* Background line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted -z-10" />
              <motion.div 
                className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-primary to-amber-600 -z-10"
                initial={{ width: 0 }}
                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />

              {[
                { num: 1, label: "Date & Time", icon: CalendarIcon },
                { num: 2, label: "Details", icon: Users },
                { num: 3, label: "Location", icon: MapPin },
                { num: 4, label: "Review", icon: Check }
              ].map((s) => (
                <motion.div 
                  key={s.num}
                  className="flex flex-col items-center relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      s.num <= step 
                        ? 'bg-gradient-to-r from-primary to-amber-600 text-white shadow-lg shadow-primary/30' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                    animate={s.num === step ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 1, repeat: s.num === step ? Infinity : 0 }}
                  >
                    {s.num < step ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    s.num <= step ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/50 shadow-xl shadow-primary/5">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                          </div>
                          Select Date & Time
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          Choose when you'd like to host your private dining experience
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
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
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Label className="mb-3 block font-semibold">Choose a time</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {timeSlots.map((time, index) => (
                            <motion.div
                              key={time}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03, duration: 0.2 }}
                            >
                              <Button
                                variant={selectedTime === time ? "gradient" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                                data-testid={`button-time-${time.replace(/\s/g, "-")}`}
                                className="w-full hover:scale-105 transition-transform"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {time}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/50 shadow-xl shadow-primary/5">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      Guest Count & Services
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Customize your dining experience with additional services
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="p-6 rounded-lg bg-gradient-to-br from-card/50 to-card border border-border/50">
                      <Label htmlFor="guests" className="mb-4 block font-semibold text-lg">Number of Guests</Label>
                      <div className="flex items-center justify-center gap-6">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:border-primary/40"
                            onClick={() => setGuestCount(Math.max(chef.minimumGuests || 2, guestCount - 1))}
                            data-testid="button-decrease-guests"
                          >
                            -
                          </Button>
                        </motion.div>
                        <motion.span 
                          className="text-5xl font-bold w-20 text-center bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent"
                          key={guestCount}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {guestCount}
                        </motion.span>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:border-primary/40"
                            onClick={() => setGuestCount(Math.min(chef.maximumGuests || 12, guestCount + 1))}
                            data-testid="button-increase-guests"
                          >
                            +
                          </Button>
                        </motion.div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Minimum {chef.minimumGuests || 2} · Maximum {chef.maximumGuests || 12} guests
                      </p>
                    </div>

                    <div>
                      <Label className="mb-4 block font-semibold text-lg">Add Services</Label>
                      <div className="space-y-3">
                        {services.map((service, index) => (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            className="cursor-pointer"
                            onClick={() => !service.included && toggleService(service.id)}
                          >
                            <div
                              className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${
                                selectedServices.includes(service.id) 
                                  ? "border-primary bg-gradient-to-br from-primary/10 to-amber-500/5 shadow-lg shadow-primary/10" 
                                  : "border-border/50 hover:border-border bg-card"
                              }`}
                            >
                              <Checkbox
                                checked={selectedServices.includes(service.id)}
                                onCheckedChange={() => toggleService(service.id)}
                                disabled={service.included}
                                data-testid={`checkbox-service-${service.id}`}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-foreground">{service.name}</p>
                                  {service.included ? (
                                    <Badge className="bg-gradient-to-r from-primary to-amber-600 border-0">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Included
                                    </Badge>
                                  ) : (
                                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                                      +${service.price}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/50 shadow-xl shadow-primary/5">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      Event Details
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Where should we host your dining experience?
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
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
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/50 shadow-xl shadow-primary/5">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      Review & Confirm
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Review your booking details before submitting
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
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
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
                className="flex justify-between mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {step > 1 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setStep(step - 1)} 
                      data-testid="button-back"
                      className="hover:bg-accent/50"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </motion.div>
                )}
                {step < 4 ? (
                  <motion.div 
                    className="ml-auto"
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="gradient"
                      size="lg"
                      onClick={() => setStep(step + 1)} 
                      disabled={!canProceed()}
                      data-testid="button-next"
                    >
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="ml-auto"
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="gradient"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={bookingMutation.isPending}
                      data-testid="button-confirm-booking"
                      className="relative overflow-hidden"
                    >
                      {bookingMutation.isPending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Clock className="h-4 w-4" />
                          </motion.div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Confirm Booking
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="sticky top-24 border-border/50 shadow-xl shadow-primary/10 overflow-hidden">
            {/* Gradient header */}
            <div className="h-2 bg-gradient-to-r from-primary via-amber-500 to-primary bg-[length:200%_auto] animate-gradient" />
            
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
                <motion.div 
                  className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ChefHat className="h-8 w-8 text-primary" />
                </motion.div>
                <div>
                  <p className="font-bold text-lg text-foreground">{chef.displayName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="font-semibold text-primary">${hourlyRate}</span>/hour
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <motion.span 
                    className="font-semibold"
                    key={subtotal}
                    initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                    animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                    transition={{ duration: 0.3 }}
                  >
                    ${subtotal.toFixed(2)}
                  </motion.span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Service Fee (8%)</span>
                  <span className="font-semibold">${serviceFee.toFixed(2)}</span>
                </div>
                
                <div className="divider-luxury my-4" />
                
                <div className="flex justify-between items-center py-2 bg-gradient-to-r from-primary/10 to-amber-500/5 rounded-lg px-4">
                  <span className="font-bold text-base">Total</span>
                  <motion.span 
                    className="font-bold text-2xl bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent"
                    key={total}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    ${total.toFixed(2)}
                  </motion.span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <p className="flex items-start gap-2">
                  <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  <span>
                    You won't be charged until the chef accepts your booking request
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

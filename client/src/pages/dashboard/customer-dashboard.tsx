import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout, DashboardNavItem } from "@/components/dashboard/dashboard-layout";
import { CustomerDesktopHeader } from "@/components/dashboard/customer-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking, ChefProfile, Review } from "@shared/schema";
import { 
  Calendar, 
  ChefHat, 
  Clock, 
  MapPin, 
  Plus, 
  Star,
  Heart,
  MessageSquare,
  Users,
  DollarSign,
  Eye,
  XCircle,
  Settings,
  CreditCard,
  Award,
  ArrowRight,
  CheckCircle,
  LayoutDashboard,
  Utensils,
  Home
} from "lucide-react";
import { format, isAfter, isBefore, addHours } from "date-fns";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNavigation } from "@/components/mobile/bottom-navigation";

const statusColors: Record<string, string> = {
  requested: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  requested: "Pending Chef Approval",
  accepted: "Chef Accepted - Awaiting Payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [activeSection, setActiveSection] = useState<string>("overview");

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: favoriteChefs } = useQuery<ChefProfile[]>({
    queryKey: ["/api/customer/favorites"],
  });

  const { data: myReviews } = useQuery<Review[]>({
    queryKey: ["/api/customer/reviews"],
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiRequest("POST", `/api/bookings/${bookingId}/cancel`);
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Booking cancelled",
        description: data.refundAmount ? `Refund of $${(data.refundAmount / 100).toFixed(2)} will be processed` : undefined
      });
      refetchBookings();
    },
    onError: () => {
      toast({ title: "Failed to cancel booking", variant: "destructive" });
    },
  });

  const submitReview = useMutation({
    mutationFn: async ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment: string }) => {
      return apiRequest("POST", `/api/bookings/${bookingId}/review`, { rating, comment });
    },
    onSuccess: () => {
      toast({ title: "Review submitted! Thank you for your feedback." });
      setReviewBooking(null);
      setReviewRating(5);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/customer/reviews"] });
      refetchBookings();
    },
    onError: () => {
      toast({ title: "Failed to submit review", variant: "destructive" });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (chefId: string) => {
      return apiRequest("DELETE", `/api/customer/favorites/${chefId}`);
    },
    onSuccess: () => {
      toast({ title: "Chef removed from favorites" });
      queryClient.invalidateQueries({ queryKey: ["/api/customer/favorites"] });
    },
  });

  const upcomingBookings = (bookings || []).filter(
    b => ["requested", "accepted", "confirmed"].includes(b.status || "")
  );
  const completedBookings = (bookings || []).filter(b => b.status === "completed");
  const cancelledBookings = (bookings || []).filter(b => b.status === "cancelled");
  const pastBookings = [...completedBookings, ...cancelledBookings].sort(
    (a, b) => new Date(b.eventDate!).getTime() - new Date(a.eventDate!).getTime()
  );

  const totalSpent = completedBookings.reduce((sum, b) => sum + parseFloat(b.total || "0"), 0);
  const needsReview = completedBookings.filter(b => !b.hasReview);

  const canCancelBooking = (booking: Booking) => {
    if (!["requested", "accepted", "confirmed"].includes(booking.status || "")) return false;
    const eventDate = new Date(booking.eventDate!);
    return isAfter(eventDate, new Date());
  };

  const getCancellationInfo = (booking: Booking) => {
    const eventDate = new Date(booking.eventDate!);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilEvent >= 48) {
      return { refundPercent: 100, message: "Full refund available (48+ hours notice)" };
    } else if (hoursUntilEvent >= 24) {
      return { refundPercent: 50, message: "50% refund available (24-48 hours notice)" };
    } else {
      return { refundPercent: 0, message: "No refund available (less than 24 hours notice)" };
    }
  };

  const customerNavItems = useMemo<DashboardNavItem[]>(
    () => [
      { id: "overview", title: "Overview", icon: LayoutDashboard },
      { 
        id: "upcoming", 
        title: "Upcoming", 
        icon: Calendar,
        badge: upcomingBookings.length > 0 ? upcomingBookings.length : undefined,
      },
      { id: "past", title: "Past", icon: Clock },
      { id: "favorites", title: "Favorites", icon: Heart },
      { id: "reviews", title: "My Reviews", icon: MessageSquare },
      { id: "more", title: "More", icon: Settings },
    ],
    [upcomingBookings.length]
  );

  const handleSectionChange = useCallback(
    (sectionId: string) => {
      if (!customerNavItems.some((item) => item.id === sectionId)) {
        return;
      }
      setActiveSection(sectionId);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${sectionId}`);
      }
    },
    [customerNavItems]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashValue = window.location.hash.replace("#", "");
      if (hashValue && customerNavItems.some((item) => item.id === hashValue)) {
        setActiveSection(hashValue);
      } else if (!hashValue) {
        setActiveSection("overview");
      }
    }
  }, [customerNavItems]);

  // Shared sections content for both desktop and mobile
  const sectionsContent = (
    <>
      {activeSection === "overview" && (
        <section id="overview" className="space-y-8">
          {/* Desktop Hero Section */}
          {!isMobile && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Message */}
              <div className="text-center space-y-3 pt-8">
                <h1 className="text-5xl font-serif font-bold text-foreground">
                  Welcome back, {user?.firstName || "Guest"} 👋
                </h1>
                <p className="text-xl text-muted-foreground">
                  What would you like to plan today?
                </p>
              </div>

              {/* Book a Chef Button */}
              <div className="flex justify-center">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-new-booking"
                >
                  <Link href="/chefs">
                    <Utensils className="mr-3 h-5 w-5" />
                    Book a Chef
                  </Link>
                </Button>
              </div>

              {/* Next Experience Section */}
              {upcomingBookings.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-900">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">Next Experience</h2>
                  </div>

                  <div className="grid md:grid-cols-[1fr_2fr] gap-6">
                    {/* Chef Avatar and Info */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800">
                        <AvatarFallback className="bg-primary/10 text-2xl">
                          <ChefHat className="h-8 w-8 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-2xl font-bold text-foreground">Chef Maria</p>
                        <p className="text-lg text-muted-foreground">
                          {upcomingBookings[0].eventDate && format(new Date(upcomingBookings[0].eventDate), "EEE, MMM d")} · {upcomingBookings[0].eventTime}
                        </p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="lg" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40">
                            View Details
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>Complete information about your reservation</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">{upcomingBookings[0].eventDate && format(new Date(upcomingBookings[0].eventDate), "MMMM d, yyyy")}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="font-medium">{upcomingBookings[0].eventTime}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Guests</p>
                                <p className="font-medium">{upcomingBookings[0].guestCount}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant="outline" className={statusColors[upcomingBookings[0].status || "requested"]}>
                                  {upcomingBookings[0].status}
                                </Badge>
                              </div>
                            </div>
                            {upcomingBookings[0].eventAddress && (
                              <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{upcomingBookings[0].eventAddress}</p>
                              </div>
                            )}
                            <div className="border-t pt-4 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${(parseFloat(upcomingBookings[0].subtotal || "0") / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Service Fee</span>
                                <span>${(parseFloat(upcomingBookings[0].serviceFee || "0") / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>${(parseFloat(upcomingBookings[0].total) / 100).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Cards Grid */}
              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* My Bookings */}
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-700"
                  onClick={() => handleSectionChange("upcoming")}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">My Bookings</h3>
                  </CardContent>
                </Card>

                {/* Find Chefs */}
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-300 dark:hover:border-amber-700"
                >
                  <Link href="/chefs">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                        <ChefHat className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Find Chefs</h3>
                    </CardContent>
                  </Link>
                </Card>

                {/* Favorites */}
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-300 dark:hover:border-pink-700"
                  onClick={() => handleSectionChange("favorites")}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
                      <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Favorites</h3>
                  </CardContent>
                </Card>

                {/* My Reviews */}
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-700"
                  onClick={() => handleSectionChange("reviews")}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                      <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">My Reviews</h3>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Mobile Version - Cleaner Layout */}
          {isMobile && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-serif font-bold text-foreground">
                  Welcome back, {user?.firstName || "Guest"} 👋
                </h1>
                <p className="text-base text-muted-foreground">
                  What would you like to plan today?
                </p>
              </div>

              {/* Book a Chef Button */}
              <div className="flex justify-center">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-10 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all w-full max-w-md"
                  data-testid="button-new-booking"
                >
                  <Link href="/chefs">
                    <Utensils className="mr-3 h-5 w-5" />
                    Book a Chef
                  </Link>
                </Button>
              </div>

              {/* Next Experience Section */}
              {upcomingBookings.length > 0 && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Next Experience</h2>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-white dark:border-gray-800">
                        <AvatarFallback className="bg-primary/10 text-lg">
                          <ChefHat className="h-7 w-7 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xl font-bold text-foreground">Chef Maria</p>
                        <p className="text-base text-muted-foreground">
                          {upcomingBookings[0].eventDate && format(new Date(upcomingBookings[0].eventDate), "EEE, MMM d")} · {upcomingBookings[0].eventTime}
                        </p>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                          <DialogDescription>Complete information about your reservation</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-medium">{upcomingBookings[0].eventDate && format(new Date(upcomingBookings[0].eventDate), "MMMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Time</p>
                              <p className="font-medium">{upcomingBookings[0].eventTime}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Guests</p>
                              <p className="font-medium">{upcomingBookings[0].guestCount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge variant="outline" className={statusColors[upcomingBookings[0].status || "requested"]}>
                                {upcomingBookings[0].status}
                              </Badge>
                            </div>
                          </div>
                          {upcomingBookings[0].eventAddress && (
                            <div>
                              <p className="text-sm text-muted-foreground">Address</p>
                              <p className="font-medium">{upcomingBookings[0].eventAddress}</p>
                            </div>
                          )}
                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>${(parseFloat(upcomingBookings[0].subtotal || "0") / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Service Fee</span>
                              <span>${(parseFloat(upcomingBookings[0].serviceFee || "0") / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg">
                              <span>Total</span>
                              <span>${(parseFloat(upcomingBookings[0].total) / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

              {/* Action Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* My Bookings */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleSectionChange("upcoming")}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">My Bookings</h3>
                  </CardContent>
                </Card>

                {/* Find Chefs */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <Link href="/chefs">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="h-14 w-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                        <ChefHat className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">Find Chefs</h3>
                    </CardContent>
                  </Link>
                </Card>

                {/* Favorites */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleSectionChange("favorites")}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
                      <Heart className="h-7 w-7 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Favorites</h3>
                  </CardContent>
                </Card>

                {/* My Reviews */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleSectionChange("reviews")}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                      <Star className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">My Reviews</h3>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </section>
      )}

      {activeSection === "upcoming" && (
        <section id="upcoming" className="space-y-6">
            {bookingsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4 justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={statusColors[booking.status || "requested"]}>
                              {statusLabels[booking.status || "requested"]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-muted">
                              <AvatarFallback className="bg-primary/10">
                                <ChefHat className="h-6 w-6 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-lg">Private Chef Experience</p>
                              <p className="text-muted-foreground">
                                {booking.eventDate && format(new Date(booking.eventDate), "EEEE, MMMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Time</p>
                              <p className="font-medium">{booking.eventTime}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Guests</p>
                              <p className="font-medium">{booking.guestCount} guests</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="font-medium">${(parseFloat(booking.total) / 100).toFixed(2)}</p>
                            </div>
                            {booking.eventAddress && (
                              <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium text-sm truncate">{booking.eventAddress.slice(0, 25)}...</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 lg:flex-col lg:justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1 lg:flex-none">
                                <Eye className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Booking Details</DialogTitle>
                                <DialogDescription>Complete information about your reservation</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">{booking.eventDate && format(new Date(booking.eventDate), "MMMM d, yyyy")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Time</p>
                                    <p className="font-medium">{booking.eventTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Guests</p>
                                    <p className="font-medium">{booking.guestCount}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant="outline" className={statusColors[booking.status || "requested"]}>
                                      {booking.status}
                                    </Badge>
                                  </div>
                                </div>
                                {booking.eventAddress && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">{booking.eventAddress}</p>
                                  </div>
                                )}
                                {booking.specialRequests && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Special Requests</p>
                                    <p>{booking.specialRequests}</p>
                                  </div>
                                )}
                                <div className="border-t pt-4 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${(parseFloat(booking.subtotal || "0") / 100).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service Fee</span>
                                    <span>${(parseFloat(booking.serviceFee || "0") / 100).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>${(parseFloat(booking.total) / 100).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {canCancelBooking(booking) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" className="flex-1 lg:flex-none text-destructive">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {getCancellationInfo(booking).message}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <div className="p-4 rounded-md bg-muted">
                                    <p className="font-medium mb-2">Refund Policy</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      <li>48+ hours before: 100% refund</li>
                                      <li>24-48 hours before: 50% refund</li>
                                      <li>Less than 24 hours: No refund</li>
                                    </ul>
                                  </div>
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelBooking.mutate(booking.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, Cancel Booking
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground mb-6">
                    Ready for your next culinary experience?
                  </p>
                  <Button asChild>
                    <Link href="/chefs">
                      Browse Chefs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
        </section>
      )}

      {activeSection === "past" && (
        <section id="past" className="space-y-6">
            {pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <Card key={booking.id} className={booking.status === "cancelled" ? "opacity-60" : ""}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-muted">
                            <AvatarFallback className="bg-primary/10">
                              <ChefHat className="h-6 w-6 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">Private Chef Experience</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.eventDate && format(new Date(booking.eventDate), "MMMM d, yyyy")} - {booking.guestCount} guests
                            </p>
                            <Badge variant="outline" className={`mt-2 ${statusColors[booking.status || "completed"]}`}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className="font-semibold">${(parseFloat(booking.total) / 100).toFixed(2)}</span>
                          {booking.status === "completed" && !booking.hasReview && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setReviewBooking(booking)}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                          )}
                          {booking.hasReview && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Reviewed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No past experiences</h3>
                  <p className="text-muted-foreground">
                    Your completed dining experiences will appear here
                  </p>
                </CardContent>
              </Card>
            )}
        </section>
      )}

      {activeSection === "favorites" && (
        <section id="favorites" className="space-y-6">
            {(favoriteChefs?.length || 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(favoriteChefs || []).map((chef) => (
                  <Card key={chef.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={chef.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {chef.displayName?.charAt(0) || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{chef.displayName}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {parseFloat(chef.averageRating || "0").toFixed(1)}
                              <span>({chef.reviewCount || 0})</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => removeFavorite.mutate(chef.id)}
                        >
                          <Heart className="h-5 w-5 text-pink-600 fill-pink-600" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(chef.cuisines || []).slice(0, 3).map((cuisine, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{cuisine}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          ${(parseFloat(chef.pricePerPerson || "0")).toFixed(0)}/person
                        </span>
                        <Button size="sm" asChild>
                          <Link href={`/chefs/${chef.id}/book`}>
                            Book Now
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No favorite chefs yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Save your favorite chefs to quickly book them again
                  </p>
                  <Button asChild>
                    <Link href="/chefs">
                      Discover Chefs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
        </section>
      )}

      {activeSection === "reviews" && (
        <section id="reviews" className="space-y-6">
            {(myReviews?.length || 0) > 0 ? (
              <div className="space-y-4">
                {(myReviews || []).map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10">
                              <ChefHat className="h-5 w-5 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Chef Experience</p>
                            <p className="text-sm text-muted-foreground">
                              {review.createdAt && format(new Date(review.createdAt), "MMMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    After completing a dining experience, you can leave a review
                  </p>
                </CardContent>
              </Card>
            )}
        </section>
      )}

      <Dialog open={!!reviewBooking} onOpenChange={(open) => !open && setReviewBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience from {reviewBooking?.eventDate && format(new Date(reviewBooking.eventDate), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm font-medium mb-3">Rating</p>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${i < reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted hover:text-yellow-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Your Review</p>
              <Textarea
                placeholder="Tell us about your dining experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewBooking(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => reviewBooking && submitReview.mutate({
                bookingId: reviewBooking.id,
                rating: reviewRating,
                comment: reviewComment
              })}
              disabled={submitReview.isPending || !reviewComment.trim()}
            >
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* More Section */}
      {activeSection === "more" && (
        <section id="more" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Settings & More</h2>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="grid gap-4">
            {/* Profile Card */}
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>View and manage your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">${totalSpent.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-4"
                  asChild
                >
                  <Link href="/chefs">
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ChefHat className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Browse Chefs</p>
                        <p className="text-sm text-muted-foreground">Find your next dining experience</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleSectionChange("upcoming")}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">View Upcoming Bookings</p>
                      <p className="text-sm text-muted-foreground">
                        {upcomingBookings.length} upcoming {upcomingBookings.length === 1 ? 'booking' : 'bookings'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleSectionChange("favorites")}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Favorite Chefs</p>
                      <p className="text-sm text-muted-foreground">
                        {favoriteChefs?.length || 0} favorite {favoriteChefs?.length === 1 ? 'chef' : 'chefs'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-lg">Support & Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/faq">
                    <MessageSquare className="mr-3 h-4 w-4" />
                    FAQ
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/contact">
                    <MessageSquare className="mr-3 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/terms">
                    <Settings className="mr-3 h-4 w-4" />
                    Terms of Service
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/privacy">
                    <Settings className="mr-3 h-4 w-4" />
                    Privacy Policy
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={(open) => !open && setReviewBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience from {reviewBooking?.eventDate && format(new Date(reviewBooking.eventDate), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm font-medium mb-3">Rating</p>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${i < reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted hover:text-yellow-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Your Review</p>
              <Textarea
                placeholder="Tell us about your dining experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewBooking(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => reviewBooking && submitReview.mutate({
                bookingId: reviewBooking.id,
                rating: reviewRating,
                comment: reviewComment
              })}
              disabled={submitReview.isPending || !reviewComment.trim()}
            >
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  // Desktop layout without sidebar
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerDesktopHeader />
        <main className="container py-8">
          {sectionsContent}
        </main>
        
        {/* Bottom Navigation for Desktop */}
        <BottomNavigation
          items={[
            { id: "home", label: "Home", icon: Home, href: "/dashboard#overview" },
            { id: "bookings", label: "Bookings", icon: Calendar, href: "/dashboard#upcoming" },
            { id: "chefs", label: "Chefs", icon: ChefHat, href: "/chefs" },
            { id: "favorites", label: "Favorites", icon: Heart, href: "/dashboard#favorites" },
            { id: "profile", label: "Profile", icon: Settings, href: "/dashboard#more" },
          ]}
        />
      </div>
    );
  }

  // Mobile layout with sidebar
  return (
    <DashboardLayout
      title="Customer Dashboard"
      description={`Welcome back, ${user?.firstName || "Guest"}`}
      navItems={customerNavItems}
      activeItemId={activeSection}
      onNavigate={handleSectionChange}
    >
      {sectionsContent}
    </DashboardLayout>
  );
}

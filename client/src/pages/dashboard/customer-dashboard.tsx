import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import type { Booking, ChefProfile, Review } from "@shared/schema";
import logoImage from "@assets/12_1765912912124.png";
import { 
  Calendar, 
  ChefHat, 
  Clock, 
  MapPin, 
  Plus, 
  Star,
  LogOut,
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
  CheckCircle
} from "lucide-react";
import { format, isAfter, isBefore, addHours } from "date-fns";
import { useState } from "react";

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
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

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
      return apiRequest(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
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
      return apiRequest(`/api/bookings/${bookingId}/review`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });
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
      return apiRequest(`/api/customer/favorites/${chefId}`, {
        method: "DELETE",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[hsl(220,30%,12%)]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <Link href="/">
              <div className="flex flex-col items-center cursor-pointer">
                <img 
                  src={logoImage} 
                  alt="Dine Maison" 
                  className="h-28 w-auto object-contain brightness-0 invert"
                />
                <div className="flex flex-col items-center -mt-10">
                  <span className="text-[9px] tracking-[0.3em] uppercase leading-tight text-white/70">
                    The Art of
                  </span>
                  <span className="text-[9px] tracking-[0.3em] uppercase leading-tight text-white/70">
                    Intimate Dining
                  </span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <ThemeToggle />
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <a href="/api/logout">
                  <LogOut className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome back, {user?.firstName || "Guest"}
            </h1>
            <p className="text-muted-foreground">Manage your dining experiences</p>
          </div>
          <Button asChild data-testid="button-new-booking">
            <Link href="/chefs">
              <Plus className="mr-2 h-4 w-4" />
              Book a Chef
            </Link>
          </Button>
        </div>

        {needsReview.length > 0 && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Share Your Experience</p>
                    <p className="text-sm text-muted-foreground">
                      You have {needsReview.length} experience{needsReview.length > 1 ? 's' : ''} waiting for your review
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setReviewBooking(needsReview[0])}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Leave Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{upcomingBookings.length}</p>
                  <p className="text-xs text-muted-foreground truncate">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{completedBookings.length}</p>
                  <p className="text-xs text-muted-foreground truncate">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">${(totalSpent / 100).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground truncate">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-pink-500/10 flex items-center justify-center shrink-0">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{favoriteChefs?.length || 0}</p>
                  <p className="text-xs text-muted-foreground truncate">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
              {upcomingBookings.length > 0 && <Badge className="ml-2">{upcomingBookings.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              <Clock className="h-4 w-4 mr-2" />
              Past
            </TabsTrigger>
            <TabsTrigger value="favorites" data-testid="tab-favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              <MessageSquare className="h-4 w-4 mr-2" />
              My Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
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
          </TabsContent>

          <TabsContent value="past">
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
          </TabsContent>

          <TabsContent value="favorites">
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
          </TabsContent>

          <TabsContent value="reviews">
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
          </TabsContent>
        </Tabs>

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
      </main>
    </div>
  );
}

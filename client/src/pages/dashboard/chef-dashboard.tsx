import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import type { Booking, ChefProfile, Review, MenuItem } from "@shared/schema";
import { Logo } from "@/components/logo";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Star,
  LogOut,
  LogIn,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp,
  CreditCard,
  AlertCircle,
  ChefHat,
  MapPin,
  Edit,
  Plus,
  ArrowUpRight,
  Wallet,
  Receipt,
  Eye,
  MessageSquare,
  Utensils,
  CalendarDays,
  CalendarCheck
} from "lucide-react";
import { format, addDays, startOfWeek, isToday, isSameDay, parseISO } from "date-fns";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const statusColors: Record<string, string> = {
  requested: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function ChefDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery<ChefProfile>({
    queryKey: ["/api/chef/profile"],
  });

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ["/api/chef/bookings"],
  });

  const { data: stripeStatus } = useQuery<{
    connected: boolean;
    onboarded: boolean;
    balance?: number;
  }>({
    queryKey: ["/api/chef/stripe-connect/status"],
    enabled: !!profile,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/chef/reviews"],
    enabled: !!profile,
  });

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/chef/menu"],
    enabled: !!profile,
  });

  const { data: earningsData } = useQuery<any[]>({
    queryKey: ["/api/chef/earnings"],
    enabled: !!profile,
  });

  const acceptBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiRequest(`/api/chef/bookings/${bookingId}/accept`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({ title: "Booking accepted!" });
      refetchBookings();
    },
    onError: () => {
      toast({ title: "Failed to accept booking", variant: "destructive" });
    },
  });

  const declineBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiRequest(`/api/chef/bookings/${bookingId}/decline`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({ title: "Booking declined" });
      refetchBookings();
    },
    onError: () => {
      toast({ title: "Failed to decline booking", variant: "destructive" });
    },
  });

  const pendingRequests = (bookings || []).filter(b => b.status === "requested");
  const upcomingBookings = (bookings || []).filter(b => ["accepted", "confirmed"].includes(b.status || ""));
  const completedBookings = (bookings || []).filter(b => b.status === "completed");
  const cancelledBookings = (bookings || []).filter(b => b.status === "cancelled");

  const totalEarnings = completedBookings.reduce((sum, b) => sum + parseFloat(b.chefPayout || "0"), 0);
  const pendingEarnings = upcomingBookings.reduce((sum, b) => sum + parseFloat(b.chefPayout || "0"), 0);
  const thisMonthEarnings = completedBookings
    .filter(b => {
      const date = new Date(b.eventDate!);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + parseFloat(b.chefPayout || "0"), 0);

  const mockEarningsData = [
    { month: "Jan", earnings: 1200 },
    { month: "Feb", earnings: 1800 },
    { month: "Mar", earnings: 2400 },
    { month: "Apr", earnings: 2100 },
    { month: "May", earnings: 3200 },
    { month: "Jun", earnings: 2800 },
  ];

  const profileCompleteness = (() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.displayName) score += 15;
    if (profile.bio && profile.bio.length > 50) score += 15;
    if (profile.profileImageUrl) score += 15;
    if (profile.specialties && profile.specialties.length > 0) score += 15;
    if (profile.cuisines && profile.cuisines.length > 0) score += 10;
    if (profile.pricePerPerson) score += 15;
    if (stripeStatus?.onboarded) score += 15;
    return Math.min(score, 100);
  })();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBookingsForDate = (date: Date) => {
    return (bookings || []).filter(b => {
      if (!b.eventDate) return false;
      return isSameDay(new Date(b.eventDate), date);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[hsl(220,30%,12%)]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="flex flex-col items-center cursor-pointer">
                  <Logo 
                    variant="large"
                    textColor="text-white"
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
              {profile?.isCertified && (
                <Badge className="bg-primary/10 text-primary border-primary/20">Certified Chef</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild className="text-white border-white/20 hover:bg-white/10">
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link href="/chef/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <ThemeToggle />
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.profileImageUrl || user?.profileImageUrl || undefined} />
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={profile?.profileImageUrl || user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {profile?.displayName || `${user?.firstName} ${user?.lastName}`}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {parseFloat(profile?.averageRating || "0").toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  {profile?.completedBookings || 0} bookings
                </span>
                {profile?.serviceAreas && profile.serviceAreas.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.serviceAreas[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild data-testid="button-view-profile">
              <Link href={`/chefs/${profile?.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Public Profile
              </Link>
            </Button>
            <Button asChild data-testid="button-edit-profile">
              <Link href="/chef/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {!stripeStatus?.onboarded && (
          <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Complete Payment Setup</p>
                    <p className="text-sm text-muted-foreground">
                      Set up your payment account to receive earnings from bookings
                    </p>
                  </div>
                </div>
                <Button asChild data-testid="button-setup-payments-banner">
                  <Link href="/chef/onboarding">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Set Up Payments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {profileCompleteness < 100 && (
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-foreground">Complete Your Profile</p>
                  <p className="text-sm text-muted-foreground">A complete profile attracts more customers</p>
                </div>
                <span className="font-medium text-primary">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{pendingRequests.length}</p>
                  <p className="text-xs text-muted-foreground truncate">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
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
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">${(thisMonthEarnings / 100).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground truncate">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{parseFloat(profile?.averageRating || "0").toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground truncate">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="requests" data-testid="tab-requests">
              <Clock className="h-4 w-4 mr-2" />
              Requests
              {pendingRequests.length > 0 && <Badge className="ml-2">{pendingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="calendar" data-testid="tab-calendar">
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="earnings" data-testid="tab-earnings">
              <Wallet className="h-4 w-4 mr-2" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              <MessageSquare className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="menu" data-testid="tab-menu">
              <Utensils className="h-4 w-4 mr-2" />
              Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            {bookingsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((booking) => (
                  <Card key={booking.id} data-testid={`card-request-${booking.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4 justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={statusColors.requested}>New Request</Badge>
                            <span className="text-sm text-muted-foreground">
                              Received {booking.createdAt && format(new Date(booking.createdAt), "MMM d 'at' h:mm a")}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-medium">{booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Time</p>
                              <p className="font-medium">{booking.eventTime}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Guests</p>
                              <p className="font-medium">{booking.guestCount} guests</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Your Payout</p>
                              <p className="font-medium text-green-600">${(parseFloat(booking.chefPayout || "0") / 100).toFixed(2)}</p>
                            </div>
                          </div>
                          {booking.specialRequests && (
                            <div>
                              <p className="text-sm text-muted-foreground">Special Requests</p>
                              <p className="text-sm">{booking.specialRequests}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 lg:flex-col lg:justify-center">
                          <Button 
                            className="flex-1"
                            onClick={() => acceptBooking.mutate(booking.id)}
                            disabled={acceptBooking.isPending}
                            data-testid={`button-accept-${booking.id}`}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => declineBooking.mutate(booking.id)}
                            disabled={declineBooking.isPending}
                            data-testid={`button-decline-${booking.id}`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
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
                  <h3 className="font-semibold text-foreground mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">
                    New booking requests will appear here for you to accept or decline
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} data-testid={`card-upcoming-${booking.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={statusColors[booking.status || "confirmed"]}>
                              {booking.status}
                            </Badge>
                            {isToday(new Date(booking.eventDate!)) && (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Today</Badge>
                            )}
                          </div>
                          <p className="font-semibold text-lg">{booking.eventDate && format(new Date(booking.eventDate), "EEEE, MMMM d, yyyy")}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {booking.eventTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {booking.guestCount} guests
                            </span>
                            {booking.eventAddress && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {booking.eventAddress.slice(0, 30)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            ${(parseFloat(booking.chefPayout || "0") / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Your payout</p>
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
                  <h3 className="font-semibold text-foreground mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground">
                    Confirmed bookings will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Calendar</CardTitle>
                <CardDescription>Your schedule for this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {weekDays.map((day, index) => {
                    const dayBookings = getBookingsForDate(day);
                    const hasBooking = dayBookings.length > 0;
                    const isPast = day < new Date() && !isToday(day);
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-md border text-center cursor-pointer transition-colors ${
                          isToday(day) 
                            ? 'border-primary bg-primary/5' 
                            : isPast 
                              ? 'border-border bg-muted/50 opacity-50'
                              : 'border-border hover-elevate'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(day, "EEE")}
                        </p>
                        <p className={`text-lg font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                          {format(day, "d")}
                        </p>
                        {hasBooking && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs px-1">
                              {dayBookings.length} event{dayBookings.length > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold mb-4">
                      {format(selectedDate, "EEEE, MMMM d")}
                    </h4>
                    {getBookingsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-3">
                        {getBookingsForDate(selectedDate).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                <ChefHat className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{booking.eventTime} - {booking.guestCount} guests</p>
                                <p className="text-sm text-muted-foreground">{booking.eventAddress?.slice(0, 40)}...</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={statusColors[booking.status || "confirmed"]}>
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-6">No events scheduled</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-3xl font-semibold">${(totalEarnings / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-3xl font-semibold">${(thisMonthEarnings / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{completedBookings.filter(b => {
                    const date = new Date(b.eventDate!);
                    const now = new Date();
                    return date.getMonth() === now.getMonth();
                  }).length} completed bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <p className="text-3xl font-semibold">${(pendingEarnings / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{upcomingBookings.length} upcoming bookings</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Over Time</CardTitle>
                <CardDescription>Your monthly earnings trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData || mockEarningsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`$${value}`, 'Earnings']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your completed bookings and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                {completedBookings.length > 0 ? (
                  <div className="space-y-3">
                    {completedBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-green-500/10 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy")}</p>
                            <p className="text-sm text-muted-foreground">{booking.guestCount} guests</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">+${(parseFloat(booking.chefPayout || "0") / 100).toFixed(2)}</p>
                          <Badge variant="outline" className={statusColors.completed}>Paid</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No completed transactions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>Feedback from your dining experiences</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-lg">{parseFloat(profile?.averageRating || "0").toFixed(1)}</span>
                  <span className="text-muted-foreground">({profile?.reviewCount || 0} reviews)</span>
                </div>
              </CardHeader>
              <CardContent>
                {(reviews?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {(reviews || []).map((review) => (
                      <div key={review.id} className="p-4 rounded-md border border-border">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>C</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Customer</p>
                              <p className="text-sm text-muted-foreground">
                                {review.createdAt && format(new Date(review.createdAt), "MMM d, yyyy")}
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">
                      Reviews from customers will appear here after completed experiences
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Menu Items</CardTitle>
                  <CardDescription>Manage your signature dishes and offerings</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/chef/menu/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {(menuItems?.length || 0) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(menuItems || []).map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 rounded-md border border-border">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="h-20 w-20 rounded-md object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            </div>
                            {item.price && (
                              <Badge variant="outline">${(parseFloat(item.price) / 100).toFixed(0)}</Badge>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            {item.dietaryInfo?.map((info, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{info}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No menu items yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your signature dishes to showcase to customers
                    </p>
                    <Button asChild>
                      <Link href="/chef/menu/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Item
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

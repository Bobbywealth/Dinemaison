import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Booking, ChefProfile } from "@shared/schema";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Star,
  LogOut,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  requested: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function ChefDashboard() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery<ChefProfile>({
    queryKey: ["/api/chef/profile"],
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/chef/bookings"],
  });

  const { data: stripeStatus } = useQuery<{
    connected: boolean;
    onboarded: boolean;
  }>({
    queryKey: ["/api/chef/stripe-connect/status"],
    enabled: !!profile,
  });

  const pendingRequests = (bookings || []).filter(b => b.status === "requested");
  const upcomingBookings = (bookings || []).filter(b => ["accepted", "confirmed"].includes(b.status || ""));
  const completedBookings = (bookings || []).filter(b => b.status === "completed");

  const totalEarnings = completedBookings.reduce((sum, b) => sum + parseFloat(b.chefPayout || "0"), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="font-serif text-xl font-medium text-foreground cursor-pointer">
                Dine <span className="text-primary">Maison</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
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
              <Button variant="ghost" size="sm" asChild>
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
              Chef Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your bookings and profile</p>
          </div>
          <Button asChild data-testid="button-edit-profile">
            <Link href="/chef/profile/edit">Edit Profile</Link>
          </Button>
        </div>

        {!stripeStatus?.onboarded && (
          <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-yellow-500/10 flex items-center justify-center">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{upcomingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">${totalEarnings.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{parseFloat(profile?.averageRating || "0").toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests" data-testid="tab-requests">
              Requests {pendingRequests.length > 0 && <Badge className="ml-2">{pendingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={statusColors.requested}>New Request</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium">{booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Time</p>
                              <p className="font-medium">{booking.eventTime}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Guests</p>
                              <p className="font-medium">{booking.guestCount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-medium">${parseFloat(booking.total).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 lg:flex-col">
                          <Button size="sm" className="flex-1" data-testid={`button-accept-${booking.id}`}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" data-testid={`button-decline-${booking.id}`}>
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
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">
                    New booking requests will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">{booking.eventDate && format(new Date(booking.eventDate), "EEEE, MMMM d, yyyy")}</p>
                          <p className="text-sm text-muted-foreground">{booking.eventTime} - {booking.guestCount} guests</p>
                        </div>
                        <Badge variant="outline" className={statusColors[booking.status || "confirmed"]}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground">
                    Confirmed bookings will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedBookings.length > 0 ? (
              <div className="space-y-4">
                {completedBookings.map((booking) => (
                  <Card key={booking.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">{booking.eventDate && format(new Date(booking.eventDate), "MMMM d, yyyy")}</p>
                          <p className="text-sm text-muted-foreground">{booking.guestCount} guests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">+${parseFloat(booking.chefPayout || "0").toFixed(2)}</p>
                          <Badge variant="outline" className={statusColors.completed}>Completed</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No completed events yet</h3>
                  <p className="text-muted-foreground">
                    Your completed experiences will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Booking } from "@shared/schema";
import { 
  Calendar, 
  ChefHat, 
  Clock, 
  MapPin, 
  Plus, 
  Star,
  LogOut
} from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  requested: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const upcomingBookings = (bookings || []).filter(
    b => ["requested", "accepted", "confirmed"].includes(b.status || "")
  );
  const pastBookings = (bookings || []).filter(
    b => ["completed", "cancelled"].includes(b.status || "")
  );

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
              <ThemeToggle />
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profileImageUrl || undefined} />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{upcomingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{pastBookings.filter(b => b.status === "completed").length}</p>
                  <p className="text-sm text-muted-foreground">Completed Experiences</p>
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
                  <p className="text-2xl font-semibold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Reviews Given</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Bookings</h2>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <ChefHat className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Chef Experience</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {booking.eventTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={statusColors[booking.status || "requested"]}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/bookings/${booking.id}`}>View Details</Link>
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
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    Ready for your next culinary experience?
                  </p>
                  <Button asChild>
                    <Link href="/chefs">Browse Chefs</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Past Experiences</h2>
            {pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.slice(0, 5).map((booking) => (
                  <Card key={booking.id} className="opacity-75">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <ChefHat className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Chef Experience</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.eventDate && format(new Date(booking.eventDate), "MMMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusColors[booking.status || "completed"]}>
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
                  <p className="text-muted-foreground">No past experiences yet</p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

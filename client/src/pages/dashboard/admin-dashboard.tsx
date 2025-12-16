import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ChefProfile, Booking, VerificationDocument } from "@shared/schema";
import logoImage from "@assets/12_1765912912124.png";
import { 
  Users, 
  ChefHat, 
  DollarSign, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  LogOut,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalChefs: number;
    totalBookings: number;
    totalRevenue: number;
    pendingVerifications: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: pendingVerifications } = useQuery<VerificationDocument[]>({
    queryKey: ["/api/admin/verifications/pending"],
  });

  const { data: recentBookings } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings/recent"],
  });

  const { data: chefs } = useQuery<ChefProfile[]>({
    queryKey: ["/api/admin/chefs"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <img 
                  src={logoImage} 
                  alt="Dine Maison" 
                  className="h-8 w-auto object-contain dark:brightness-150 dark:contrast-125 cursor-pointer"
                />
              </Link>
              <Badge variant="secondary">Admin</Badge>
            </div>
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
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
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
                  <p className="text-2xl font-semibold text-foreground">{stats?.totalChefs || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Chefs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-green-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats?.totalBookings || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">${(stats?.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">GMV</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-yellow-500/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats?.pendingVerifications || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verifications" data-testid="tab-verifications">
              Verifications
              {(pendingVerifications?.length || 0) > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingVerifications?.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="chefs" data-testid="tab-chefs">Chefs</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Chef Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {(pendingVerifications?.length || 0) > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chef</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(pendingVerifications || []).map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.chefId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.documentType}</Badge>
                          </TableCell>
                          <TableCell>{doc.createdAt && format(new Date(doc.createdAt), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" data-testid={`button-approve-${doc.id}`}>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`button-reject-${doc.id}`}>
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending verifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {(recentBookings?.length || 0) > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Chef</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(recentBookings || []).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}...</TableCell>
                          <TableCell>{booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy")}</TableCell>
                          <TableCell>{booking.chefId.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <Badge variant="outline">{booking.status}</Badge>
                          </TableCell>
                          <TableCell>${parseFloat(booking.total).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bookings yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chefs">
            <Card>
              <CardHeader>
                <CardTitle>Registered Chefs</CardTitle>
              </CardHeader>
              <CardContent>
                {(chefs?.length || 0) > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(chefs || []).map((chef) => (
                        <TableRow key={chef.id}>
                          <TableCell className="font-medium">{chef.displayName}</TableCell>
                          <TableCell>
                            <Badge variant={chef.isCertified ? "default" : "secondary"}>
                              {chef.isCertified ? "Certified" : chef.verificationLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>{parseFloat(chef.averageRating || "0").toFixed(1)}</TableCell>
                          <TableCell>{chef.completedBookings}</TableCell>
                          <TableCell>
                            <Badge variant={chef.isActive ? "default" : "secondary"}>
                              {chef.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No chefs registered yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Markets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-md border border-border">
                    <span>NY / NJ</span>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md border border-border">
                    <span>Tampa Bay</span>
                    <Badge>Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commission Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-md border border-border">
                    <span>Marketplace Chefs</span>
                    <span className="font-semibold">15-20%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md border border-border">
                    <span>Certified Chefs</span>
                    <span className="font-semibold">25-35%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

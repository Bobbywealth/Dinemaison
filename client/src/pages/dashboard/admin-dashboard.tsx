import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import type { ChefProfile, Booking, VerificationDocument, User } from "@shared/schema";
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
  AlertCircle,
  Search,
  Eye,
  Ban,
  UserCheck,
  FileText,
  CreditCard,
  Activity,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Send,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const statusColors: Record<string, string> = {
  requested: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  pending_payout: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const verificationBadgeColors: Record<string, string> = {
  none: "bg-muted text-muted-foreground",
  basic: "bg-blue-500/10 text-blue-600",
  verified: "bg-green-500/10 text-green-600",
  certified: "bg-primary/10 text-primary",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChef, setSelectedChef] = useState<ChefProfile | null>(null);
  const [userFilter, setUserFilter] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalChefs: number;
    totalBookings: number;
    totalRevenue: number;
    pendingVerifications: number;
    monthlyGrowth: number;
    pendingPayouts: number;
    activeBookings: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: pendingVerifications, refetch: refetchVerifications } = useQuery<VerificationDocument[]>({
    queryKey: ["/api/admin/verifications/pending"],
  });

  const { data: recentBookings } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings/recent"],
  });

  const { data: allBookings } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
  });

  const { data: chefs, refetch: refetchChefs } = useQuery<ChefProfile[]>({
    queryKey: ["/api/admin/chefs"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pendingPayouts } = useQuery<any[]>({
    queryKey: ["/api/admin/payouts/pending"],
  });

  const { data: revenueData } = useQuery<any[]>({
    queryKey: ["/api/admin/analytics/revenue"],
  });

  const approveVerification = useMutation({
    mutationFn: async (docId: number) => {
      return apiRequest(`/api/admin/verifications/${docId}/approve`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({ title: "Verification approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verifications/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chefs"] });
    },
    onError: () => {
      toast({ title: "Failed to approve verification", variant: "destructive" });
    },
  });

  const rejectVerification = useMutation({
    mutationFn: async (docId: number) => {
      return apiRequest(`/api/admin/verifications/${docId}/reject`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({ title: "Verification rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verifications/pending"] });
    },
    onError: () => {
      toast({ title: "Failed to reject verification", variant: "destructive" });
    },
  });

  const processChefPayout = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiRequest(`/api/admin/payouts/${bookingId}/process`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({ title: "Payout processed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: () => {
      toast({ title: "Failed to process payout", variant: "destructive" });
    },
  });

  const toggleChefStatus = useMutation({
    mutationFn: async ({ chefId, isActive }: { chefId: string; isActive: boolean }) => {
      return apiRequest(`/api/admin/chefs/${chefId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      toast({ title: "Chef status updated" });
      refetchChefs();
    },
    onError: () => {
      toast({ title: "Failed to update chef status", variant: "destructive" });
    },
  });

  const mockRevenueData = [
    { name: "Mon", revenue: 2400, bookings: 4 },
    { name: "Tue", revenue: 1398, bookings: 3 },
    { name: "Wed", revenue: 3800, bookings: 6 },
    { name: "Thu", revenue: 2908, bookings: 5 },
    { name: "Fri", revenue: 4800, bookings: 8 },
    { name: "Sat", revenue: 6800, bookings: 12 },
    { name: "Sun", revenue: 5200, bookings: 9 },
  ];

  const bookingStatusData = [
    { name: "Completed", value: allBookings?.filter(b => b.status === "completed").length || 0, color: "#C9A962" },
    { name: "Confirmed", value: allBookings?.filter(b => b.status === "confirmed").length || 0, color: "#22c55e" },
    { name: "Pending", value: allBookings?.filter(b => b.status === "requested").length || 0, color: "#eab308" },
    { name: "Cancelled", value: allBookings?.filter(b => b.status === "cancelled").length || 0, color: "#ef4444" },
  ];

  const filteredChefs = (chefs || []).filter(chef =>
    chef.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chef.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = (users || []).filter(u => {
    if (userFilter === "all") return true;
    return u.role === userFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[hsl(220,30%,12%)]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <div className="flex items-center gap-4">
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
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
            </div>
            <div className="flex items-center gap-3">
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
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-muted-foreground truncate">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{stats?.totalChefs || 0}</p>
                  <p className="text-xs text-muted-foreground truncate">Active Chefs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{stats?.totalBookings || 0}</p>
                  <p className="text-xs text-muted-foreground truncate">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">${((stats?.totalRevenue || 0) / 100).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground truncate">GMV</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-foreground">{stats?.pendingVerifications || 0}</p>
                  <p className="text-xs text-muted-foreground truncate">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-base">Revenue Overview</CardTitle>
                  <CardDescription>Weekly booking revenue</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ArrowUpRight className="h-4 w-4" />
                    +12.5%
                  </span>
                  <span className="text-muted-foreground">vs last week</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData || mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking Status</CardTitle>
              <CardDescription>Current distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {bookingStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="verifications" data-testid="tab-verifications">
              <Shield className="h-4 w-4 mr-2" />
              Verifications
              {(pendingVerifications?.length || 0) > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingVerifications?.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="chefs" data-testid="tab-chefs">
              <ChefHat className="h-4 w-4 mr-2" />
              Chefs
            </TabsTrigger>
            <TabsTrigger value="payouts" data-testid="tab-payouts">
              <Wallet className="h-4 w-4 mr-2" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Pending Chef Verifications</CardTitle>
                  <CardDescription>Review and approve chef documents</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchVerifications()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {(pendingVerifications?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {(pendingVerifications || []).map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md border border-border">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Chef ID: {doc.chefId.slice(0, 8)}...</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{doc.documentType}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {doc.createdAt && format(new Date(doc.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => window.open(doc.documentUrl, '_blank')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 sm:flex-none"
                            onClick={() => approveVerification.mutate(doc.id)}
                            disabled={approveVerification.isPending}
                            data-testid={`button-approve-${doc.id}`}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => rejectVerification.mutate(doc.id)}
                            disabled={rejectVerification.isPending}
                            data-testid={`button-reject-${doc.id}`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">All caught up</h3>
                    <p className="text-muted-foreground">No pending verifications at this time</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>View and manage platform bookings</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {(allBookings?.length || 0) > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Chef</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(allBookings || []).slice(0, 10).map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}...</TableCell>
                            <TableCell>{booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy")}</TableCell>
                            <TableCell>{booking.customerId.slice(0, 8)}...</TableCell>
                            <TableCell>{booking.chefId.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[booking.status || "requested"]}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">${(parseFloat(booking.total) / 100).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground">Bookings will appear here once customers start booking</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chefs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Chef Management</CardTitle>
                  <CardDescription>View and manage registered chefs</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search chefs..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-chefs"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredChefs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredChefs.map((chef) => (
                      <div key={chef.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-md border border-border">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={chef.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {chef.displayName?.charAt(0) || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{chef.displayName}</p>
                              <Badge variant="outline" className={verificationBadgeColors[chef.verificationLevel || "none"]}>
                                {chef.isCertified ? "Certified" : chef.verificationLevel}
                              </Badge>
                              {!chef.isActive && (
                                <Badge variant="destructive">Inactive</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {chef.completedBookings || 0} bookings
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {parseFloat(chef.averageRating || "0").toFixed(1)} rating
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${(parseFloat(chef.pricePerPerson || "0")).toFixed(0)}/person
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1 lg:flex-none" onClick={() => setSelectedChef(chef)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>{selectedChef?.displayName}</DialogTitle>
                                <DialogDescription>Chef profile details</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedChef?.profileImageUrl || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                      {selectedChef?.displayName?.charAt(0) || "C"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-lg">{selectedChef?.displayName}</p>
                                    <Badge variant="outline" className={verificationBadgeColors[selectedChef?.verificationLevel || "none"]}>
                                      {selectedChef?.isCertified ? "Certified" : selectedChef?.verificationLevel}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                                  <p className="text-sm">{selectedChef?.bio || "No bio provided"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Specialties</p>
                                    <div className="flex flex-wrap gap-1">
                                      {(selectedChef?.specialties || []).map((s, i) => (
                                        <Badge key={i} variant="secondary">{s}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Cuisines</p>
                                    <div className="flex flex-wrap gap-1">
                                      {(selectedChef?.cuisines || []).map((c, i) => (
                                        <Badge key={i} variant="outline">{c}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="p-3 rounded-md bg-muted">
                                    <p className="text-xl font-semibold">{selectedChef?.completedBookings || 0}</p>
                                    <p className="text-xs text-muted-foreground">Bookings</p>
                                  </div>
                                  <div className="p-3 rounded-md bg-muted">
                                    <p className="text-xl font-semibold">{parseFloat(selectedChef?.averageRating || "0").toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">Rating</p>
                                  </div>
                                  <div className="p-3 rounded-md bg-muted">
                                    <p className="text-xl font-semibold">${(parseFloat(selectedChef?.pricePerPerson || "0")).toFixed(0)}</p>
                                    <p className="text-xs text-muted-foreground">Per Person</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant={chef.isActive ? "outline" : "default"}
                            size="sm"
                            className="flex-1 lg:flex-none"
                            onClick={() => toggleChefStatus.mutate({ chefId: chef.id, isActive: !chef.isActive })}
                            disabled={toggleChefStatus.isPending}
                          >
                            {chef.isActive ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No chefs found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Try a different search term" : "No chefs registered yet"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Pending Payouts</CardTitle>
                <CardDescription>Process chef payments for completed bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {(pendingPayouts?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {(pendingPayouts || []).map((payout) => (
                      <div key={payout.bookingId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md border border-border">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-md bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Chef: {payout.chefName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                Booking completed {payout.completedDate && format(new Date(payout.completedDate), "MMM d")}
                              </span>
                              <Badge variant="outline" className={statusColors.pending_payout}>
                                Pending
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="text-right">
                            <p className="font-semibold text-lg">${(payout.amount / 100).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Chef payout</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => processChefPayout.mutate(payout.bookingId)}
                            disabled={processChefPayout.isPending}
                            data-testid={`button-payout-${payout.bookingId}`}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Process
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No pending payouts</h3>
                    <p className="text-muted-foreground">Payouts will appear here after bookings are completed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage platform users</CardDescription>
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="chef">Chefs</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.slice(0, 15).map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={u.profileImageUrl || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{u.firstName} {u.lastName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {u.createdAt && format(new Date(u.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                Active
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No users found</h3>
                    <p className="text-muted-foreground">Users will appear here once they sign up</p>
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

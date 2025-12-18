import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { DashboardLayout, DashboardNavItem } from "@/components/dashboard/dashboard-layout";
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
import { useToast } from "@/hooks/use-toast";
import type { ChefProfile, Booking, VerificationDocument, User } from "@shared/schema";
import {
  Users,
  ChefHat,
  DollarSign,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
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
  RefreshCw,
  Star,
  MessageSquare,
  MapPin,
  Settings,
  Download,
  Plus,
  Trash2,
  EyeOff,
  Flag,
  History,
  Percent,
  Target,
  TrendingDown,
  UserPlus,
  LayoutDashboard,
  CheckSquare,
  LogOut,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useState, useMemo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
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
  Cell,
  ReferenceLine
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
  const [revenuePeriod, setRevenuePeriod] = useState<string>("weekly");
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [addMarketOpen, setAddMarketOpen] = useState(false);
  const [newMarketName, setNewMarketName] = useState("");
  const [newMarketDescription, setNewMarketDescription] = useState("");
  const [addChefOpen, setAddChefOpen] = useState(false);
  const [newChefData, setNewChefData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
    profileImageUrl: "",
    yearsExperience: 0,
    cuisines: [] as string[],
    dietarySpecialties: [] as string[],
    servicesOffered: [] as string[],
    minimumSpend: "250",
    minimumGuests: 2,
    maximumGuests: 12,
    hourlyRate: "150",
    verificationLevel: "basic",
    isCertified: false,
    isActive: true,
    commissionRate: "15",
  });

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

  const { data: revenueData } = useQuery<{ name: string; revenue: number; bookings: number }[]>({
    queryKey: ["/api/admin/analytics/revenue", revenuePeriod],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/revenue?period=${revenuePeriod}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch revenue data");
      return res.json();
    },
  });

  const { data: activityFeed } = useQuery<any[]>({
    queryKey: ["/api/admin/activity-feed"],
  });

  const { data: userGrowthData } = useQuery<any[]>({
    queryKey: ["/api/admin/analytics/user-growth"],
  });

  const { data: chefPerformance } = useQuery<any[]>({
    queryKey: ["/api/admin/analytics/chef-performance"],
  });

  const { data: platformMetrics } = useQuery<any>({
    queryKey: ["/api/admin/analytics/metrics"],
  });

  const { data: allReviews, refetch: refetchReviews } = useQuery<any[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const { data: allMarkets, refetch: refetchMarkets } = useQuery<any[]>({
    queryKey: ["/api/admin/markets"],
  });

  const { data: platformSettings, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: transactions } = useQuery<any[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const { data: payoutHistory } = useQuery<any[]>({
    queryKey: ["/api/admin/payouts/history"],
  });

  const { data: chefPipeline } = useQuery<any[]>({
    queryKey: ["/api/admin/chefs/pipeline"],
  });

  const approveVerification = useMutation({
    mutationFn: async (docId: string) => {
      return apiRequest("POST", `/api/admin/verifications/${docId}/approve`);
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
    mutationFn: async (docId: string) => {
      return apiRequest("POST", `/api/admin/verifications/${docId}/reject`);
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
      return apiRequest("POST", `/api/admin/payouts/${bookingId}/process`);
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
      return apiRequest("PATCH", `/api/admin/chefs/${chefId}/status`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "Chef status updated" });
      refetchChefs();
    },
    onError: () => {
      toast({ title: "Failed to update chef status", variant: "destructive" });
    },
  });

  const createChef = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/chefs", data);
    },
    onSuccess: () => {
      toast({ title: "Chef created successfully!" });
      setAddChefOpen(false);
      setNewChefData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        displayName: "",
        bio: "",
        profileImageUrl: "",
        yearsExperience: 0,
        cuisines: [] as string[],
        dietarySpecialties: [] as string[],
        servicesOffered: [] as string[],
        minimumSpend: "250",
        minimumGuests: 2,
        maximumGuests: 12,
        hourlyRate: "150",
        verificationLevel: "basic",
        isCertified: false,
        isActive: true,
        commissionRate: "15",
      });
      refetchChefs();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create chef",
        description: error.message || "Please check your input and try again",
        variant: "destructive"
      });
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest("PATCH", `/api/admin/reviews/${id}`, updates);
    },
    onSuccess: () => {
      toast({ title: "Review updated" });
      refetchReviews();
    },
    onError: () => {
      toast({ title: "Failed to update review", variant: "destructive" });
    },
  });

  const createMarket = useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string }) => {
      return apiRequest("POST", "/api/admin/markets", data);
    },
    onSuccess: () => {
      toast({ title: "Market created successfully!" });
      setAddMarketOpen(false);
      setNewMarketName("");
      setNewMarketDescription("");
      refetchMarkets();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create market", 
        description: error.message || "Please check your input and try again",
        variant: "destructive" 
      });
    },
  });

  const updateMarket = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest("PATCH", `/api/admin/markets/${id}`, updates);
    },
    onSuccess: () => {
      toast({ title: "Market updated" });
      refetchMarkets();
    },
    onError: () => {
      toast({ title: "Failed to update market", variant: "destructive" });
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return apiRequest("POST", "/api/admin/settings", { key, value });
    },
    onSuccess: () => {
      toast({ title: "Setting updated" });
      refetchSettings();
    },
    onError: () => {
      toast({ title: "Failed to update setting", variant: "destructive" });
    },
  });

  const handleExport = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/export/${type}`, { credentials: "include" });
      if (!res.ok) {
        toast({ title: "Export failed", variant: "destructive" });
        return;
      }
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await res.json();
        if (data.csv) {
          const blob = new Blob([data.csv], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = data.filename || `${type}_export.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast({ title: "Export downloaded" });
        } else {
          toast({ title: "No data to export", variant: "destructive" });
        }
      } else {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: "Export downloaded" });
      }
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const mockRevenueData = [
    { name: "Mon", revenue: 2400, bookings: 4 },
    { name: "Tue", revenue: -800, bookings: 0 },
    { name: "Wed", revenue: 3800, bookings: 6 },
    { name: "Thu", revenue: -1200, bookings: 0 },
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
    chef.cuisines?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = (users || []).filter((u: any) => {
    if (userFilter === "all") return true;
    return u.role === userFilter;
  });

  const adminNavItems = useMemo<DashboardNavItem[]>(
    () => [
      { id: "overview", title: "Overview", icon: LayoutDashboard },
      { id: "activity", title: "Activity Feed", icon: Activity },
      { id: "tasks", title: "Tasks", icon: CheckSquare, href: "/tasks" },
      {
        id: "verifications",
        title: "Verifications",
        icon: Shield,
        badge: pendingVerifications?.length && pendingVerifications.length > 0 ? pendingVerifications.length : undefined,
      },
      { id: "bookings", title: "Bookings", icon: Calendar },
      { id: "chefs", title: "Chefs", icon: ChefHat },
      { id: "payouts", title: "Payouts", icon: Wallet },
      { id: "users", title: "Users", icon: Users },
      { id: "analytics", title: "Analytics", icon: BarChart3 },
      { id: "reviews", title: "Reviews", icon: Star },
      { id: "markets", title: "Markets", icon: MapPin },
      { id: "transactions", title: "Transactions", icon: History },
      { id: "settings", title: "Settings", icon: Settings },
      { id: "more", title: "More", icon: MoreHorizontal },
    ],
    [pendingVerifications?.length]
  );

  const handleSectionChange = useCallback(
    (sectionId: string) => {
      if (!adminNavItems.some((item) => item.id === sectionId)) {
        return;
      }

      setActiveSection(sectionId);

      if (typeof window === "undefined") {
        return;
      }

      const newHash = `#${sectionId}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", newHash);
      }

      window.requestAnimationFrame(() => {
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (sectionId === "overview") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },
    [adminNavItems]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncFromHash = () => {
      const hashValue = window.location.hash.replace("#", "");
      if (hashValue && adminNavItems.some((item) => item.id === hashValue)) {
        handleSectionChange(hashValue);
      } else if (!hashValue) {
        setActiveSection((prev) => {
          if (prev !== "overview") {
            window.requestAnimationFrame(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            });
          }
          return "overview";
        });
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [adminNavItems, handleSectionChange]);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="Platform overview and management"
      navItems={adminNavItems}
      activeItemId={activeSection}
      onNavigate={handleSectionChange}
    >
      {activeSection === "overview" && (
        <section id="overview" className="space-y-6">
        {/* Stats Grid - Clean 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.totalChefs || 0}</div>
              <div className="text-sm text-muted-foreground">Active Chefs</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats?.totalBookings || 0}</div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">${((stats?.totalRevenue || 0) / 100).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">GMV</div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout for Revenue and Booking Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue This Week */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Revenue This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-6">
                ${((stats?.totalRevenue || 0) / 100).toLocaleString()}
              </div>
              {/* Mini Revenue Chart */}
              <div className="h-24 mb-4 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData?.slice(-7) || mockRevenueData}>
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between group hover:bg-transparent"
                onClick={() => handleSectionChange("analytics")}
              >
                <span>View Analytics</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Booking Status */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Booking Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
                <span className="font-semibold">
                  {allBookings?.filter(b => b.status === "completed").length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <span className="font-semibold">
                  {allBookings?.filter(b => b.status === "requested").length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                </div>
                <span className="font-semibold">
                  {allBookings?.filter(b => b.status === "confirmed").length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Cancelled</span>
                </div>
                <span className="font-semibold">
                  {allBookings?.filter(b => b.status === "cancelled").length || 0}
                </span>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between group hover:bg-transparent mt-2"
                onClick={() => handleSectionChange("bookings")}
              >
                <span>View Bookings</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {(recentBookings?.length || 0) > 0 ? (
              <div className="space-y-3">
                {(recentBookings || []).slice(0, 2).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => handleSectionChange("bookings")}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {booking.customerId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Booking #{booking.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0", statusColors[booking.status || "requested"])}>
                      {booking.status}
                    </Badge>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent bookings
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => handleSectionChange("verifications")}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                </div>
                <span className="font-medium">Approve Chefs</span>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleSectionChange("reviews")}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Pending Reviews</span>
                  {pendingVerifications && pendingVerifications.length > 0 && (
                    <Badge variant="secondary" className="rounded-full">
                      {pendingVerifications.length}
                    </Badge>
                  )}
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </CardContent>
        </Card>
        </section>
      )}

      {activeSection === "verifications" && (
        <section id="verifications" className="space-y-6">
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
        </section>
      )}

      {activeSection === "bookings" && (
        <section id="bookings" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg">All Bookings</CardTitle>
                    <CardDescription className="text-xs md:text-sm">View and manage platform bookings</CardDescription>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-40 rounded-xl">
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
                </div>
                
                {/* Mobile: Horizontal filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:hidden scrollbar-hide">
                  <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
                    All
                  </button>
                  <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium whitespace-nowrap hover:bg-primary/10">
                    Pending
                  </button>
                  <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium whitespace-nowrap hover:bg-primary/10">
                    Confirmed
                  </button>
                  <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-xs font-medium whitespace-nowrap hover:bg-primary/10">
                    Cancelled
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {(allBookings?.length || 0) > 0 ? (
                  <>
                    {/* Mobile: Card list view */}
                    <div className="space-y-3 md:hidden">
                      {(allBookings || []).slice(0, 10).map((booking) => (
                        <div key={booking.id} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold text-sm">{booking.eventDate && format(new Date(booking.eventDate), "MMM d, yyyy")}</p>
                                <p className="text-xs text-muted-foreground font-mono">ID: {booking.id.slice(0, 8)}</p>
                              </div>
                              <Badge variant="outline" className={cn("text-xs shrink-0", statusColors[booking.status || "requested"])}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Chef: {booking.chefId.slice(0, 8)}</span>
                              <span className="font-semibold text-foreground text-sm">${(parseFloat(booking.total) / 100).toFixed(2)}</span>
                            </div>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground">
                            <ArrowUpRight className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Table view */}
                    <div className="hidden md:block overflow-x-auto">
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
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">No bookings yet</h3>
                    <p className="text-muted-foreground text-xs md:text-sm">Bookings will appear here once customers start booking</p>
                  </div>
                )}
              </CardContent>
            </Card>
        </section>
      )}

      {activeSection === "chefs" && (
        <section id="chefs" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg">Chef Management</CardTitle>
                    <CardDescription className="text-xs md:text-sm">View and manage registered chefs</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search chefs..." 
                        className="pl-9 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-search-chefs"
                      />
                    </div>
                    <Button 
                      onClick={() => setAddChefOpen(true)}
                      size="sm"
                      className="rounded-xl shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Chef
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredChefs.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {filteredChefs.map((chef) => (
                      <div key={chef.id} className="flex items-start gap-3 md:gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <Avatar className="h-12 w-12 md:h-14 md:w-14 shrink-0">
                          <AvatarImage src={chef.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {chef.displayName?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm md:text-base truncate">{chef.displayName}</p>
                              <div className="flex items-center gap-2 flex-wrap mt-1">
                                <Badge variant="outline" className={cn("text-xs", verificationBadgeColors[chef.verificationLevel || "none"])}>
                                  {chef.isCertified ? "Certified" : chef.verificationLevel}
                                </Badge>
                                {!chef.isActive && (
                                  <Badge variant="destructive" className="text-xs">Inactive</Badge>
                                )}
                              </div>
                            </div>
                            {/* Desktop actions */}
                            <div className="hidden lg:flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedChef(chef)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg rounded-2xl">
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
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Cuisines</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(selectedChef?.cuisines || []).map((s: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Dietary</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(selectedChef?.dietarySpecialties || []).map((c: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                      <div className="p-3 rounded-xl bg-muted">
                                        <p className="text-xl font-semibold">{selectedChef?.completedBookings || 0}</p>
                                        <p className="text-xs text-muted-foreground">Bookings</p>
                                      </div>
                                      <div className="p-3 rounded-xl bg-muted">
                                        <p className="text-xl font-semibold">{parseFloat(selectedChef?.averageRating || "0").toFixed(1)}</p>
                                        <p className="text-xs text-muted-foreground">Rating</p>
                                      </div>
                                      <div className="p-3 rounded-xl bg-muted">
                                        <p className="text-xl font-semibold">${(parseFloat(selectedChef?.minimumSpend || "0")).toFixed(0)}</p>
                                        <p className="text-xs text-muted-foreground">Minimum</p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant={chef.isActive ? "outline" : "default"}
                                size="sm"
                                className="rounded-xl"
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
                          <div className="grid grid-cols-3 gap-2 md:gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3 shrink-0" />
                              <span className="truncate">{chef.completedBookings || 0} bookings</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 shrink-0 text-amber-500" />
                              <span>{parseFloat(chef.averageRating || "0").toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 shrink-0" />
                              <span className="truncate">${(parseFloat(chef.minimumSpend || "0")).toFixed(0)}</span>
                            </div>
                          </div>
                          {/* Mobile: Tap to view more */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button 
                                className="lg:hidden mt-2 text-xs text-primary font-medium flex items-center gap-1"
                                onClick={() => setSelectedChef(chef)}
                              >
                                View Details <ArrowUpRight className="h-3 w-3" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[90vw] rounded-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-base">{selectedChef?.displayName}</DialogTitle>
                                <DialogDescription className="text-xs">Chef profile details</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-14 w-14">
                                    <AvatarImage src={selectedChef?.profileImageUrl || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {selectedChef?.displayName?.charAt(0) || "C"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">{selectedChef?.displayName}</p>
                                    <Badge variant="outline" className={cn("text-xs", verificationBadgeColors[selectedChef?.verificationLevel || "none"])}>
                                      {selectedChef?.isCertified ? "Certified" : selectedChef?.verificationLevel}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Bio</p>
                                  <p className="text-sm">{selectedChef?.bio || "No bio provided"}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div className="p-2 rounded-xl bg-muted">
                                    <p className="text-lg font-semibold">{selectedChef?.completedBookings || 0}</p>
                                    <p className="text-[10px] text-muted-foreground">Bookings</p>
                                  </div>
                                  <div className="p-2 rounded-xl bg-muted">
                                    <p className="text-lg font-semibold">{parseFloat(selectedChef?.averageRating || "0").toFixed(1)}</p>
                                    <p className="text-[10px] text-muted-foreground">Rating</p>
                                  </div>
                                  <div className="p-2 rounded-xl bg-muted">
                                    <p className="text-lg font-semibold">${(parseFloat(selectedChef?.minimumSpend || "0")).toFixed(0)}</p>
                                    <p className="text-[10px] text-muted-foreground">Min</p>
                                  </div>
                                </div>
                                <Button 
                                  variant={selectedChef?.isActive ? "outline" : "default"}
                                  size="sm"
                                  className="w-full rounded-xl"
                                  onClick={() => {
                                    if (selectedChef) {
                                      toggleChefStatus.mutate({ chefId: selectedChef.id, isActive: !selectedChef.isActive });
                                    }
                                  }}
                                  disabled={toggleChefStatus.isPending}
                                >
                                  {selectedChef?.isActive ? "Suspend Chef" : "Activate Chef"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">No chefs found</h3>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      {searchQuery ? "Try a different search term" : "No chefs registered yet"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Chef Dialog */}
            <Dialog open={addChefOpen} onOpenChange={setAddChefOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Chef</DialogTitle>
                  <DialogDescription>
                    Create a new chef account with profile details
                  </DialogDescription>
                </DialogHeader>
                <div className="mb-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNewChefData({
                      email: "ameer.natson@dinemaison.com",
                      password: "chef123",
                      firstName: "Ameer",
                      lastName: "Natson",
                      displayName: "Ameer Natson",
                      bio: "Visionary culinary artist blending bold international flavors with refined technique. With a passion for innovation and a deep respect for tradition, Chef Ameer crafts unforgettable dining experiences that celebrate the art of food. From contemporary fusion to classic comfort with a twist, his dynamic approach transforms every meal into a memorable journey. Known for his creative plating, locally-sourced ingredients, and warm hospitality, Chef Ameer brings both expertise and soul to your table.",
                      profileImageUrl: "https://freeimage.host/i/fl0CC0b",
                      yearsExperience: 12,
                      cuisines: ["Contemporary American", "Fusion", "Mediterranean", "Caribbean"],
                      dietarySpecialties: ["Vegan", "Vegetarian", "Gluten-Free", "Paleo"],
                      servicesOffered: ["Private Dinner", "Event Catering", "Meal Prep", "Cooking Class"],
                      minimumSpend: "300",
                      minimumGuests: 2,
                      maximumGuests: 16,
                      hourlyRate: "175",
                      verificationLevel: "certified",
                      isCertified: true,
                      isActive: true,
                      commissionRate: "15",
                    })}
                  >
                    Load Ameer Natson Template
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={newChefData.firstName}
                        onChange={(e) => setNewChefData({ ...newChefData, firstName: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={newChefData.lastName}
                        onChange={(e) => setNewChefData({ ...newChefData, lastName: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newChefData.email}
                      onChange={(e) => setNewChefData({ ...newChefData, email: e.target.value })}
                      placeholder="chef@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={newChefData.password}
                      onChange={(e) => setNewChefData({ ...newChefData, password: e.target.value })}
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Name</label>
                    <Input
                      value={newChefData.displayName}
                      onChange={(e) => setNewChefData({ ...newChefData, displayName: e.target.value })}
                      placeholder="e.g. Chef John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                      value={newChefData.bio}
                      onChange={(e) => setNewChefData({ ...newChefData, bio: e.target.value })}
                      placeholder="Tell us about the chef's experience and specialties..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Image URL</label>
                    <Input
                      value={newChefData.profileImageUrl}
                      onChange={(e) => setNewChefData({ ...newChefData, profileImageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Years of Experience</label>
                      <Input
                        type="number"
                        value={newChefData.yearsExperience}
                        onChange={(e) => setNewChefData({ ...newChefData, yearsExperience: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hourly Rate ($)</label>
                      <Input
                        value={newChefData.hourlyRate}
                        onChange={(e) => setNewChefData({ ...newChefData, hourlyRate: e.target.value })}
                        placeholder="150"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Spend ($)</label>
                      <Input
                        value={newChefData.minimumSpend}
                        onChange={(e) => setNewChefData({ ...newChefData, minimumSpend: e.target.value })}
                        placeholder="250"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Guests</label>
                      <Input
                        type="number"
                        value={newChefData.minimumGuests}
                        onChange={(e) => setNewChefData({ ...newChefData, minimumGuests: parseInt(e.target.value) || 2 })}
                        placeholder="2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Guests</label>
                      <Input
                        type="number"
                        value={newChefData.maximumGuests}
                        onChange={(e) => setNewChefData({ ...newChefData, maximumGuests: parseInt(e.target.value) || 12 })}
                        placeholder="12"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cuisines (comma separated)</label>
                    <Input
                      value={newChefData.cuisines.join(", ")}
                      onChange={(e) => setNewChefData({ 
                        ...newChefData, 
                        cuisines: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="Italian, French, Mediterranean"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dietary Specialties (comma separated)</label>
                    <Input
                      value={newChefData.dietarySpecialties.join(", ")}
                      onChange={(e) => setNewChefData({ 
                        ...newChefData, 
                        dietarySpecialties: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="Vegan, Gluten-Free, Vegetarian"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Services Offered (comma separated)</label>
                    <Input
                      value={newChefData.servicesOffered.join(", ")}
                      onChange={(e) => setNewChefData({ 
                        ...newChefData, 
                        servicesOffered: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="Private Dinner, Cooking Class, Event Catering"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddChefOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      createChef.mutate({
                        email: newChefData.email,
                        password: newChefData.password,
                        firstName: newChefData.firstName,
                        lastName: newChefData.lastName,
                        chefProfile: {
                          displayName: newChefData.displayName,
                          bio: newChefData.bio,
                          profileImageUrl: newChefData.profileImageUrl || undefined,
                          yearsExperience: newChefData.yearsExperience,
                          cuisines: newChefData.cuisines,
                          dietarySpecialties: newChefData.dietarySpecialties,
                          servicesOffered: newChefData.servicesOffered,
                          minimumSpend: newChefData.minimumSpend,
                          minimumGuests: newChefData.minimumGuests,
                          maximumGuests: newChefData.maximumGuests,
                          hourlyRate: newChefData.hourlyRate,
                          verificationLevel: newChefData.verificationLevel,
                          isCertified: newChefData.isCertified,
                          isActive: newChefData.isActive,
                          commissionRate: newChefData.commissionRate,
                        }
                      });
                    }}
                    disabled={createChef.isPending || !newChefData.email || !newChefData.password || !newChefData.firstName || !newChefData.lastName || !newChefData.displayName}
                  >
                    {createChef.isPending ? "Creating..." : "Create Chef"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </section>
      )}

      {activeSection === "payouts" && (
        <section id="payouts" className="space-y-6">
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
        </section>
      )}

      {activeSection === "users" && (
        <section id="users" className="space-y-6">
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
                        {filteredUsers.slice(0, 15).map((u: any) => (
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
        </section>
      )}

      {/* Activity Feed Section */}
      {activeSection === "activity" && (
        <section id="activity" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>Real-time platform activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('activity')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {(activityFeed?.length || 0) > 0 ? (
                  <div className="space-y-3">
                    {(activityFeed || []).slice(0, 20).map((activity: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-md border border-border">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.type === 'booking' ? 'bg-blue-500/10 text-blue-500' :
                          activity.type === 'user' ? 'bg-green-500/10 text-green-500' :
                          activity.type === 'chef' ? 'bg-amber-500/10 text-amber-500' :
                          activity.type === 'review' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {activity.type === 'booking' && <Calendar className="h-4 w-4" />}
                          {activity.type === 'user' && <UserPlus className="h-4 w-4" />}
                          {activity.type === 'chef' && <ChefHat className="h-4 w-4" />}
                          {activity.type === 'review' && <Star className="h-4 w-4" />}
                          {activity.type === 'payout' && <DollarSign className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp && format(new Date(activity.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No recent activity</h3>
                    <p className="text-muted-foreground">Platform activity will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
        </section>
      )}

      {/* Analytics Section - Mobile Optimized */}
      {activeSection === "analytics" && (
        <section id="analytics" className="space-y-6">
            <div className="space-y-4 md:space-y-6">
              {/* Revenue Overview Chart */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <CardTitle className="text-base md:text-lg">Revenue Overview</CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        {revenuePeriod === "daily" ? "Last 7 days" : revenuePeriod === "monthly" ? "Last 6 months" : "Weekly"} booking revenue
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-xl overflow-hidden border border-border">
                        <Button 
                          variant={revenuePeriod === "daily" ? "default" : "ghost"} 
                          size="sm" 
                          className="rounded-none text-xs px-2 md:px-3"
                          onClick={() => setRevenuePeriod("daily")}
                          data-testid="button-revenue-daily"
                        >
                          Daily
                        </Button>
                        <Button 
                          variant={revenuePeriod === "weekly" ? "default" : "ghost"} 
                          size="sm" 
                          className="rounded-none text-xs px-2 md:px-3 border-x border-border"
                          onClick={() => setRevenuePeriod("weekly")}
                          data-testid="button-revenue-weekly"
                        >
                          Weekly
                        </Button>
                        <Button 
                          variant={revenuePeriod === "monthly" ? "default" : "ghost"} 
                          size="sm" 
                          className="rounded-none text-xs px-2 md:px-3"
                          onClick={() => setRevenuePeriod("monthly")}
                          data-testid="button-revenue-monthly"
                        >
                          Monthly
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData || mockRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis 
                          className="text-xs" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          domain={['auto', 'auto']}
                          tickFormatter={(value: number) => value < 0 ? `-$${Math.abs(value)}` : `$${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px'
                          }}
                          formatter={(value: number) => {
                            if (value < 0) {
                              return [`-$${Math.abs(value).toLocaleString()}`, 'Loss'];
                            }
                            return [`$${value.toLocaleString()}`, 'Revenue'];
                          }}
                        />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                        <Bar 
                          dataKey="revenue" 
                          radius={[6, 6, 0, 0]}
                          fill="hsl(var(--primary))"
                        >
                          {(revenueData || mockRevenueData).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.revenue < 0 ? '#ef4444' : 'hsl(var(--primary))'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-primary" />
                      <span className="text-muted-foreground">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-red-500" />
                      <span className="text-muted-foreground">Refunds/Loss</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Status Distribution */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Booking Status Distribution</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Current breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
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
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {bookingStatusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground text-xs md:text-sm">{item.name}</span>
                        <span className="font-semibold ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Chart */}
              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="text-base md:text-lg">User Growth</CardTitle>
                    <CardDescription className="text-xs md:text-sm">New users over time</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport('users')} className="rounded-xl">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {userGrowthData && userGrowthData.length > 0 ? (
                    <div className="h-64 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} className="text-xs" />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} className="text-xs" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                          <Line type="monotone" dataKey="chefs" stroke="hsl(var(--accent))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">No user growth data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs md:text-sm text-muted-foreground">Conversion</p>
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">{platformMetrics?.conversionRate?.toFixed(1) || 0}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs md:text-sm text-muted-foreground">Avg Value</p>
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">${platformMetrics?.avgBookingValue?.toFixed(0) || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs md:text-sm text-muted-foreground">Retention</p>
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">{platformMetrics?.chefRetention?.toFixed(1) || 0}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs md:text-sm text-muted-foreground">Platform Fee</p>
                        <Percent className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">{platformMetrics?.platformFeeRate || 15}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chef Performance - Mobile Optimized */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Top Performing Chefs</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Ranked by bookings and ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  {(chefPerformance?.length || 0) > 0 ? (
                    <div className="space-y-3 md:hidden">
                      {/* Mobile: Card list */}
                      {(chefPerformance || []).slice(0, 10).map((chef: any) => (
                        <div key={chef.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{chef.displayName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{chef.completedBookings} bookings</span>
                              <span>${(chef.totalRevenue || 0).toFixed(0)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            {parseFloat(chef.averageRating || "0").toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 md:hidden">
                      <p className="text-muted-foreground text-sm">No chef performance data available</p>
                    </div>
                  )}
                  
                  {/* Desktop: Table */}
                  {(chefPerformance?.length || 0) > 0 ? (
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Chef</TableHead>
                            <TableHead>Bookings</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Rating</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(chefPerformance || []).slice(0, 10).map((chef: any) => (
                            <TableRow key={chef.id}>
                              <TableCell className="font-medium">{chef.displayName}</TableCell>
                              <TableCell>{chef.completedBookings}</TableCell>
                              <TableCell>${(chef.totalRevenue || 0).toFixed(0)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  {parseFloat(chef.averageRating || "0").toFixed(1)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 hidden md:block">
                      <p className="text-muted-foreground">No chef performance data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
        </section>
      )}

      {/* Reviews Section */}
      {activeSection === "reviews" && (
        <section id="reviews" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Review Moderation</CardTitle>
                  <CardDescription>Monitor and moderate customer reviews</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchReviews()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {(allReviews?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {(allReviews || []).slice(0, 15).map((review: any) => (
                      <div key={review.id} className="p-4 rounded-md border border-border">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[1,2,3,4,5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} 
                                  />
                                ))}
                              </div>
                              <Badge variant={review.isHidden ? "destructive" : "outline"}>
                                {review.isHidden ? "Hidden" : "Visible"}
                              </Badge>
                            </div>
                            <p className="text-sm">{review.comment || "No comment"}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {review.createdAt && format(new Date(review.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateReview.mutate({ id: review.id, updates: { isHidden: !review.isHidden } })}
                            >
                              {review.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateReview.mutate({ id: review.id, updates: { isFlagged: !review.isFlagged } })}
                            >
                              <Flag className={`h-4 w-4 ${review.isFlagged ? 'text-red-500' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">Reviews will appear here once customers leave feedback</p>
                  </div>
                )}
              </CardContent>
            </Card>
        </section>
      )}

      {/* Markets Section */}
      {activeSection === "markets" && (
        <section id="markets" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Market Management</CardTitle>
                  <CardDescription>Manage available service markets</CardDescription>
                </div>
                <Dialog open={addMarketOpen} onOpenChange={setAddMarketOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Market
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Market</DialogTitle>
                      <DialogDescription>
                        Create a new geographic market for chef services
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="market-name" className="text-sm font-medium">
                          Market Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="market-name"
                          placeholder="e.g., New York City"
                          value={newMarketName}
                          onChange={(e) => setNewMarketName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="market-description" className="text-sm font-medium">
                          Description (optional)
                        </label>
                        <Input
                          id="market-description"
                          placeholder="e.g., Manhattan, Brooklyn, Queens, Bronx"
                          value={newMarketDescription}
                          onChange={(e) => setNewMarketDescription(e.target.value)}
                        />
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                          <strong>Slug:</strong> {newMarketName ? newMarketName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '(auto-generated)'}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddMarketOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (!newMarketName.trim()) {
                            toast({
                              title: "Market name is required",
                              variant: "destructive",
                            });
                            return;
                          }
                          const slug = newMarketName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                          createMarket.mutate({
                            name: newMarketName.trim(),
                            slug: slug,
                            description: newMarketDescription.trim() || undefined,
                          });
                        }}
                        disabled={createMarket.isPending || !newMarketName.trim()}
                      >
                        {createMarket.isPending ? "Creating..." : "Create Market"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {(allMarkets?.length || 0) > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Chefs</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(allMarkets || []).map((market: any) => (
                        <TableRow key={market.id}>
                          <TableCell className="font-medium">{market.name}</TableCell>
                          <TableCell className="text-muted-foreground">{market.slug}</TableCell>
                          <TableCell>{market.chefCount || 0}</TableCell>
                          <TableCell>
                            <Badge variant={market.isActive ? "outline" : "secondary"}>
                              {market.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateMarket.mutate({ id: market.id, updates: { isActive: !market.isActive } })}
                            >
                              {market.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No markets configured</h3>
                    <p className="text-muted-foreground">Add markets to enable chef services in different regions</p>
                  </div>
                )}
              </CardContent>
            </Card>
        </section>
      )}

      {/* Transactions Section */}
      {activeSection === "transactions" && (
        <section id="transactions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All financial transactions on the platform</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('transactions')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {(transactions?.length || 0) > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(transactions || []).slice(0, 20).map((tx: any) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-mono text-sm">{tx.id.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <Badge variant="outline">{tx.type}</Badge>
                            </TableCell>
                            <TableCell className={tx.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                              {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={tx.status === 'completed' ? 'outline' : 'secondary'}>
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {tx.createdAt && format(new Date(tx.createdAt), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">Transactions will appear here once payments are processed</p>
                  </div>
                )}
              </CardContent>
            </Card>
        </section>
      )}

      {/* More Section - Mobile Settings Style */}
      {activeSection === "more" && (
        <section id="more" className="space-y-6">
            <div className="space-y-4 md:space-y-6">
              {/* Account Section */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-0">
                  <button
                    onClick={() => handleSectionChange("users")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">Users</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>

              {/* Operations Section */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-0">
                  <button
                    onClick={() => handleSectionChange("payouts")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-sm">Payouts</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleSectionChange("transactions")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <History className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-medium text-sm">Transactions</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleSectionChange("reviews")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Star className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-sm">Reviews</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleSectionChange("markets")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <span className="font-medium text-sm">Markets</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>

              {/* System Section */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-0">
                  <button
                    onClick={() => handleSectionChange("settings")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-slate-600" />
                      </div>
                      <span className="font-medium text-sm">Settings</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleSectionChange("activity")}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="font-medium text-sm">Activity Log</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>

              {/* Logout */}
              <Card className="rounded-2xl border-destructive/20">
                <CardContent className="p-0">
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                      queryClient.setQueryData(["/api/auth/user"], null);
                      window.location.href = "/";
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 text-destructive hover:bg-destructive/10 transition-colors rounded-2xl"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-semibold text-sm">Logout</span>
                  </button>
                </CardContent>
              </Card>
            </div>
        </section>
      )}

      {/* Settings Section */}
      {activeSection === "settings" && (
        <section id="settings" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure platform-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Platform Fee (%)</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue={platformSettings?.find((s: any) => s.key === 'platformFee')?.value || 15}
                          className="w-24"
                          onBlur={(e) => updateSetting.mutate({ key: 'platformFee', value: e.target.value })}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Commission taken from each booking</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Minimum Booking Amount</label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          defaultValue={platformSettings?.find((s: any) => s.key === 'minBooking')?.value || 100}
                          className="w-24"
                          onBlur={(e) => updateSetting.mutate({ key: 'minBooking', value: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Minimum order value for bookings</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payout Delay (days)</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue={platformSettings?.find((s: any) => s.key === 'payoutDelay')?.value || 3}
                          className="w-24"
                          onBlur={(e) => updateSetting.mutate({ key: 'payoutDelay', value: e.target.value })}
                        />
                        <span className="text-muted-foreground">days</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Days after booking completion before chef payout</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cancellation Window (hours)</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue={platformSettings?.find((s: any) => s.key === 'cancellationWindow')?.value || 48}
                          className="w-24"
                          onBlur={(e) => updateSetting.mutate({ key: 'cancellationWindow', value: e.target.value })}
                        />
                        <span className="text-muted-foreground">hours</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Hours before event for free cancellation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Administrative actions and exports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="justify-start" onClick={() => handleExport('bookings')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Bookings
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => handleExport('chefs')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Chefs
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => handleExport('users')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Users
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => handleExport('transactions')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
        </section>
      )}
    </DashboardLayout>
  );
}

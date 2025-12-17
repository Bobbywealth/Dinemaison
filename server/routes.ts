import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { insertBookingSchema, insertChefProfileSchema, insertReviewSchema, users, type User } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated } from "./auth";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";

function getUserId(req: Request): string | null {
  const user = req.user as any;
  return user?.id || null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/user/role", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    res.json(role || { role: "customer" });
  });

  app.get("/api/chefs", async (req: Request, res: Response) => {
    try {
      const filters = {
        search: req.query.search as string,
        cuisine: req.query.cuisine as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
        marketId: req.query.market as string,
        isActive: true,
      };
      const chefs = await storage.getChefs(filters);
      res.json(chefs);
    } catch (error) {
      console.error("Error fetching chefs:", error);
      res.status(500).json({ message: "Failed to fetch chefs" });
    }
  });

  app.get("/api/chefs/:id", async (req: Request, res: Response) => {
    try {
      const chef = await storage.getChefById(req.params.id);
      if (!chef) {
        return res.status(404).json({ message: "Chef not found" });
      }
      res.json(chef);
    } catch (error) {
      console.error("Error fetching chef:", error);
      res.status(500).json({ message: "Failed to fetch chef" });
    }
  });

  app.get("/api/chefs/:id/reviews", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/chefs/:id/gallery", async (req: Request, res: Response) => {
    try {
      const gallery = await storage.getChefGallery(req.params.id);
      res.json(gallery);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.get("/api/chef/profile", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching chef profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/chef/profile", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const data = insertChefProfileSchema.parse({
        ...req.body,
        userId,
      });
      const profile = await storage.createChefProfile(data);
      await storage.setUserRole(userId, "chef");
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating chef profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/chef/profile", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      const updated = await storage.updateChefProfile(profile.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating chef profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/chef/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      const bookingsList = await storage.getBookings({ chefId: profile.id });
      res.json(bookingsList);
    } catch (error) {
      console.error("Error fetching chef bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const bookingsList = await storage.getBookings({ customerId: userId });
      res.json(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.customerId !== userId) {
        const chefProfile = await storage.getChefByUserId(userId);
        if (!chefProfile || chefProfile.id !== booking.chefId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const data = insertBookingSchema.parse({
        ...req.body,
        customerId: userId,
        status: "requested",
        paymentStatus: "pending",
        payoutStatus: "pending",
      });
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const chefProfile = await storage.getChefByUserId(userId);
      if (booking.customerId !== userId && (!chefProfile || chefProfile.id !== booking.chefId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updated = await storage.updateBooking(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.post("/api/bookings/:id/review", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.customerId !== userId) {
        return res.status(403).json({ message: "Only the customer can leave a review" });
      }
      if (booking.status !== "completed") {
        return res.status(400).json({ message: "Can only review completed bookings" });
      }
      const data = insertReviewSchema.parse({
        ...req.body,
        bookingId: booking.id,
        chefId: booking.chefId,
        customerId: userId,
      });
      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/markets", async (req: Request, res: Response) => {
    try {
      const marketsList = await storage.getMarkets();
      res.json(marketsList);
    } catch (error) {
      console.error("Error fetching markets:", error);
      res.status(500).json({ message: "Failed to fetch markets" });
    }
  });

  app.get("/api/stripe/publishable-key", async (req: Request, res: Response) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error fetching Stripe key:", error);
      res.status(500).json({ message: "Failed to fetch Stripe key" });
    }
  });

  app.post("/api/bookings/:id/checkout", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.customerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (booking.paymentStatus === "paid") {
        return res.status(400).json({ message: "Booking already paid" });
      }

      const chef = await storage.getChefById(booking.chefId);
      if (!chef) {
        return res.status(404).json({ message: "Chef not found" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let customerId = await storage.getUserStripeCustomerId(userId);
      if (!customerId) {
        const customer = await stripeService.createCustomer(
          user.email || '',
          userId,
          `${user.firstName || ''} ${user.lastName || ''}`.trim()
        );
        await storage.setUserStripeCustomerId(userId, customer.id);
        customerId = customer.id;
      }

      const baseUrl = process.env.APP_URL || 
        (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000');

      const session = await stripeService.createBookingCheckoutSession(
        customerId,
        booking,
        chef,
        `${baseUrl}/dashboard?payment=success&booking=${booking.id}`,
        `${baseUrl}/dashboard?payment=cancelled&booking=${booking.id}`
      );

      await storage.updateBooking(booking.id, {
        stripePaymentIntentId: session.payment_intent as string,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/bookings/:id/cancel", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const isCustomer = booking.customerId === userId;
      const chefProfile = await storage.getChefByUserId(userId);
      const isChef = chefProfile && chefProfile.id === booking.chefId;
      const userRole = await storage.getUserRole(userId);
      const isAdmin = userRole?.role === "admin";
      const adminOverride = req.body.adminOverride && isAdmin;

      if (!isCustomer && !isChef && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const eventDate = new Date(booking.eventDate);
      const now = new Date();
      const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      let refundAmount = 0;
      let refundPercentage = 0;
      const total = parseFloat(booking.total);
      const serviceFee = parseFloat(booking.serviceFee || "0");

      if (adminOverride) {
        refundPercentage = req.body.refundPercentage || 100;
        refundAmount = (total * refundPercentage) / 100;
      } else if (hoursUntilEvent >= 48) {
        refundPercentage = 100;
        refundAmount = total - serviceFee;
      } else if (hoursUntilEvent >= 24) {
        refundPercentage = 50;
        refundAmount = (total - serviceFee) * 0.5;
      } else {
        refundPercentage = 0;
        refundAmount = 0;
      }

      if (booking.paymentStatus === "paid" && booking.stripePaymentIntentId && refundAmount > 0) {
        try {
          await stripeService.refundPayment(
            booking.stripePaymentIntentId,
            refundAmount,
            'requested_by_customer'
          );
        } catch (refundError) {
          console.error("Refund failed:", refundError);
        }
      }

      const updated = await storage.updateBooking(booking.id, {
        status: "cancelled",
        paymentStatus: refundAmount > 0 ? "refunded" : booking.paymentStatus,
      });

      res.json({ 
        booking: updated, 
        refundAmount, 
        refundPercentage,
        message: refundAmount > 0 
          ? `Booking cancelled. $${refundAmount.toFixed(2)} refunded (${refundPercentage}%).`
          : "Booking cancelled. No refund issued due to cancellation policy."
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  app.post("/api/chef/stripe-connect/onboard", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let accountId = profile.stripeConnectAccountId;
      
      if (!accountId) {
        const account = await stripeService.createConnectedAccount(
          user.email || '',
          profile.id,
          user.firstName || '',
          user.lastName || ''
        );
        accountId = account.id;
        await storage.updateChefProfile(profile.id, { stripeConnectAccountId: accountId });
      }

      const baseUrl = process.env.APP_URL || 
        (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000');

      const accountLink = await stripeService.createAccountLink(
        accountId,
        `${baseUrl}/dashboard?stripe=refresh`,
        `${baseUrl}/dashboard?stripe=success`
      );

      res.json({ url: accountLink.url });
    } catch (error) {
      console.error("Error creating Stripe Connect account:", error);
      res.status(500).json({ message: "Failed to setup payment account" });
    }
  });

  app.get("/api/chef/stripe-connect/status", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      if (!profile.stripeConnectAccountId) {
        return res.json({ connected: false, onboarded: false });
      }

      const account = await stripeService.getAccountStatus(profile.stripeConnectAccountId);
      const onboarded = account.charges_enabled && account.payouts_enabled;

      if (onboarded !== profile.stripeConnectOnboarded) {
        await storage.updateChefProfile(profile.id, { stripeConnectOnboarded: onboarded });
      }

      res.json({ 
        connected: true, 
        onboarded,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      });
    } catch (error) {
      console.error("Error fetching Stripe Connect status:", error);
      res.status(500).json({ message: "Failed to fetch payment account status" });
    }
  });

  app.post("/api/admin/bookings/:id/payout", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.status !== "completed") {
        return res.status(400).json({ message: "Booking must be completed to issue payout" });
      }
      if (booking.payoutStatus === "paid") {
        return res.status(400).json({ message: "Payout already issued" });
      }

      const chef = await storage.getChefById(booking.chefId);
      if (!chef || !chef.stripeConnectAccountId) {
        return res.status(400).json({ message: "Chef has not set up payment account" });
      }

      const payoutAmount = await stripeService.calculateChefPayout(booking, chef);

      const transfer = await stripeService.createTransfer(
        payoutAmount,
        chef.stripeConnectAccountId,
        booking.id,
        `Payout for booking ${booking.id}`
      );

      await storage.updateBooking(booking.id, {
        chefPayout: payoutAmount.toFixed(2),
        payoutStatus: "paid",
      });

      res.json({ 
        success: true, 
        payoutAmount, 
        transferId: transfer.id 
      });
    } catch (error) {
      console.error("Error issuing payout:", error);
      res.status(500).json({ message: "Failed to issue payout" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/analytics/revenue", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const period = (req.query.period as string) || "weekly";
      const revenueData = await storage.getRevenueAnalytics(period);
      res.json(revenueData);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/admin/verifications/pending", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const verifications = await storage.getPendingVerifications();
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ message: "Failed to fetch verifications" });
    }
  });

  app.get("/api/admin/chefs", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const chefs = await storage.getChefs({ isActive: undefined });
      res.json(chefs);
    } catch (error) {
      console.error("Error fetching chefs:", error);
      res.status(500).json({ message: "Failed to fetch chefs" });
    }
  });

  app.get("/api/admin/bookings/recent", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const bookingsList = await storage.getBookings({});
      res.json(bookingsList.slice(0, 20));
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/admin/verifications/:id/review", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { status, notes } = req.body;
      const result = await storage.reviewVerificationDocument(
        req.params.id,
        status,
        userId,
        notes
      );
      res.json(result);
    } catch (error) {
      console.error("Error reviewing verification:", error);
      res.status(500).json({ message: "Failed to review verification" });
    }
  });

  app.post("/api/admin/verifications/:id/approve", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const result = await storage.reviewVerificationDocument(
        req.params.id,
        "approved",
        userId,
        ""
      );
      res.json(result);
    } catch (error) {
      console.error("Error approving verification:", error);
      res.status(500).json({ message: "Failed to approve verification" });
    }
  });

  app.post("/api/admin/verifications/:id/reject", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const result = await storage.reviewVerificationDocument(
        req.params.id,
        "rejected",
        userId,
        req.body.notes || ""
      );
      res.json(result);
    } catch (error) {
      console.error("Error rejecting verification:", error);
      res.status(500).json({ message: "Failed to reject verification" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const allUsers = await db.select().from(users);
      const userRoles = await storage.getAllUserRoles();
      const usersWithRoles = allUsers.map(u => ({
        ...u,
        role: userRoles.find(r => r.userId === u.id)?.role || "customer",
      }));
      res.json(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const bookingsList = await storage.getBookings({});
      res.json(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/payouts/pending", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const bookings = await storage.getBookings({ status: "completed" });
      const pendingPayouts = bookings
        .filter(b => b.payoutStatus !== "paid")
        .map(async (b) => {
          const chef = await storage.getChefById(b.chefId);
          return {
            bookingId: b.id,
            chefId: b.chefId,
            chefName: chef?.displayName || "Unknown Chef",
            amount: parseFloat(b.chefPayout || b.subtotal || "0"),
            completedDate: b.eventDate,
          };
        });
      const payouts = await Promise.all(pendingPayouts);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching pending payouts:", error);
      res.status(500).json({ message: "Failed to fetch pending payouts" });
    }
  });

  app.post("/api/admin/payouts/:bookingId/process", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const booking = await storage.getBookingById(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const chef = await storage.getChefById(booking.chefId);
      if (!chef?.stripeConnectAccountId) {
        return res.status(400).json({ message: "Chef has not set up payment account" });
      }

      const payoutAmount = parseFloat(booking.chefPayout || booking.subtotal || "0");
      
      try {
        await stripeService.createTransfer(
          payoutAmount,
          chef.stripeConnectAccountId,
          booking.id,
          `Payout for booking ${booking.id}`
        );
      } catch (stripeError) {
        console.error("Stripe transfer failed:", stripeError);
      }

      await storage.updateBooking(booking.id, { payoutStatus: "paid" });
      res.json({ success: true, amount: payoutAmount });
    } catch (error) {
      console.error("Error processing payout:", error);
      res.status(500).json({ message: "Failed to process payout" });
    }
  });

  app.patch("/api/admin/chefs/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { isActive } = req.body;
      const updated = await storage.updateChefProfile(req.params.id, { isActive });
      res.json(updated);
    } catch (error) {
      console.error("Error updating chef status:", error);
      res.status(500).json({ message: "Failed to update chef status" });
    }
  });

  app.get("/api/chef/reviews", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      const reviews = await storage.getReviews(profile.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching chef reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/chef/menu", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      const menuItems = await storage.getChefMenuItems(profile.id);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/chef/earnings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      const bookings = await storage.getBookings({ chefId: profile.id, status: "completed" });
      const monthlyEarnings: Record<string, number> = {};
      bookings.forEach(b => {
        if (b.eventDate) {
          const month = new Date(b.eventDate).toLocaleString('en-US', { month: 'short' });
          monthlyEarnings[month] = (monthlyEarnings[month] || 0) + parseFloat(b.chefPayout || "0") / 100;
        }
      });
      const earningsData = Object.entries(monthlyEarnings).map(([month, earnings]) => ({
        month,
        earnings: Math.round(earnings),
      }));
      res.json(earningsData);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  app.post("/api/chef/bookings/:id/accept", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.chefId !== profile.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updated = await storage.updateBooking(booking.id, { status: "accepted" });
      res.json(updated);
    } catch (error) {
      console.error("Error accepting booking:", error);
      res.status(500).json({ message: "Failed to accept booking" });
    }
  });

  app.post("/api/chef/bookings/:id/decline", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const profile = await storage.getChefByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Chef profile not found" });
      }
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.chefId !== profile.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updated = await storage.updateBooking(booking.id, { status: "cancelled" });
      res.json(updated);
    } catch (error) {
      console.error("Error declining booking:", error);
      res.status(500).json({ message: "Failed to decline booking" });
    }
  });

  app.get("/api/customer/favorites", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const favorites = await storage.getCustomerFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/customer/favorites/:chefId", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      await storage.addCustomerFavorite(userId, req.params.chefId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/customer/favorites/:chefId", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      await storage.removeCustomerFavorite(userId, req.params.chefId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/customer/reviews", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const reviews = await storage.getCustomerReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Activity Feed
  app.get("/api/admin/activity-feed", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getActivityFeed(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // User Growth Analytics
  app.get("/api/admin/analytics/user-growth", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const period = (req.query.period as string) || "daily";
      const data = await storage.getUserGrowthAnalytics(period);
      res.json(data);
    } catch (error) {
      console.error("Error fetching user growth:", error);
      res.status(500).json({ message: "Failed to fetch user growth" });
    }
  });

  // Chef Performance Analytics
  app.get("/api/admin/analytics/chef-performance", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const data = await storage.getChefPerformanceAnalytics();
      res.json(data);
    } catch (error) {
      console.error("Error fetching chef performance:", error);
      res.status(500).json({ message: "Failed to fetch chef performance" });
    }
  });

  // Platform Metrics
  app.get("/api/admin/analytics/metrics", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const metrics = await storage.getPlatformMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching platform metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // All Reviews (for moderation)
  app.get("/api/admin/reviews", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Update Review (moderation)
  app.patch("/api/admin/reviews/:id", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const updated = await storage.updateReview(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Markets Management
  app.get("/api/admin/markets", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const allMarkets = await storage.getMarkets();
      res.json(allMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      res.status(500).json({ message: "Failed to fetch markets" });
    }
  });

  app.post("/api/admin/markets", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const market = await storage.createMarket(req.body);
      res.json(market);
    } catch (error) {
      console.error("Error creating market:", error);
      res.status(500).json({ message: "Failed to create market" });
    }
  });

  app.patch("/api/admin/markets/:id", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const updated = await storage.updateMarket(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating market:", error);
      res.status(500).json({ message: "Failed to update market" });
    }
  });

  app.delete("/api/admin/markets/:id", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      await storage.deleteMarket(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting market:", error);
      res.status(500).json({ message: "Failed to delete market" });
    }
  });

  // Platform Settings
  app.get("/api/admin/settings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const settings = await storage.getAllPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const { key, value } = req.body;
      const setting = await storage.setPlatformSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Transaction History
  app.get("/api/admin/transactions", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const type = req.query.type as string;
      const transactions = await storage.getTransactionHistory({ type });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Payout History
  app.get("/api/admin/payouts/history", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const payouts = await storage.getPayoutHistory();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payout history:", error);
      res.status(500).json({ message: "Failed to fetch payout history" });
    }
  });

  // User Details
  app.get("/api/admin/users/:id", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const userDetails = await storage.getUserWithDetails(req.params.id);
      res.json(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // Chef Onboarding Pipeline
  app.get("/api/admin/chefs/pipeline", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    try {
      const pipeline = await storage.getChefOnboardingPipeline();
      res.json(pipeline);
    } catch (error) {
      console.error("Error fetching chef pipeline:", error);
      res.status(500).json({ message: "Failed to fetch chef pipeline" });
    }
  });

  // CSV Export endpoint
  app.get("/api/admin/export/:type", isAuthenticated, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const role = await storage.getUserRole(userId);
    if (role?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    
    try {
      const exportType = req.params.type;
      let data: any[] = [];
      let filename = "";
      
      switch (exportType) {
        case "bookings":
          const bookingsList = await storage.getBookings({});
          data = bookingsList.map(b => ({
            id: b.id,
            date: b.eventDate,
            status: b.status,
            guestCount: b.guestCount,
            subtotal: b.subtotal,
            serviceFee: b.serviceFee,
            total: b.total,
            paymentStatus: b.paymentStatus,
            payoutStatus: b.payoutStatus,
          }));
          filename = "bookings-export.csv";
          break;
        case "transactions":
          data = await storage.getTransactionHistory({});
          filename = "transactions-export.csv";
          break;
        case "users":
          const usersList = await db.select().from(users);
          const rolesList = await storage.getAllUserRoles();
          data = usersList.map(u => {
            const userRole = rolesList.find(r => r.userId === u.id);
            return {
              id: u.id,
              email: u.email,
              firstName: u.firstName,
              lastName: u.lastName,
              role: userRole?.role || "customer",
              createdAt: u.createdAt,
            };
          });
          filename = "users-export.csv";
          break;
        case "revenue":
          const revenueData = await storage.getRevenueAnalytics("monthly");
          data = revenueData;
          filename = "revenue-export.csv";
          break;
        default:
          return res.status(400).json({ message: "Invalid export type" });
      }
      
      if (data.length === 0) {
        return res.status(200).json({ csv: "", filename });
      }
      
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];
      for (const row of data) {
        const values = headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          if (typeof val === "string" && val.includes(",")) return `"${val}"`;
          return String(val);
        });
        csvRows.push(values.join(","));
      }
      
      res.json({ csv: csvRows.join("\n"), filename });
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  return httpServer;
}

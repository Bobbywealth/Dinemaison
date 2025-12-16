import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertChefProfileSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated, authStorage } from "./replit_integrations/auth";

function getUserId(req: Request): string | null {
  const user = req.user as any;
  return user?.claims?.sub || null;
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

  return httpServer;
}

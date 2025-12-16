import { db } from "./db";
import { eq, desc, and, sql, like, gte, lte } from "drizzle-orm";
import {
  type User,
  users,
  type ChefProfile,
  type InsertChefProfile,
  chefProfiles,
  type ChefGalleryItem,
  type InsertChefGalleryItem,
  chefGallery,
  type ChefAvailability,
  type InsertChefAvailability,
  chefAvailability,
  type VerificationDocument,
  type InsertVerificationDocument,
  verificationDocuments,
  type Market,
  type InsertMarket,
  markets,
  type Booking,
  type InsertBooking,
  bookings,
  type Review,
  type InsertReview,
  reviews,
  type UserRole,
  type InsertUserRole,
  userRoles,
  type PlatformSetting,
  platformSettings,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: Partial<User> & { id: string }): Promise<User>;
  getUserStripeCustomerId(userId: string): Promise<string | null>;
  setUserStripeCustomerId(userId: string, customerId: string): Promise<void>;
  
  getUserRole(userId: string): Promise<UserRole | undefined>;
  setUserRole(userId: string, role: string): Promise<UserRole>;
  
  getChefs(filters?: {
    search?: string;
    cuisine?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    marketId?: string;
    isActive?: boolean;
  }): Promise<ChefProfile[]>;
  getChefById(id: string): Promise<ChefProfile | undefined>;
  getChefByUserId(userId: string): Promise<ChefProfile | undefined>;
  createChefProfile(profile: InsertChefProfile): Promise<ChefProfile>;
  updateChefProfile(id: string, updates: Partial<ChefProfile>): Promise<ChefProfile | undefined>;
  
  getChefGallery(chefId: string): Promise<ChefGalleryItem[]>;
  addChefGalleryItem(item: InsertChefGalleryItem): Promise<ChefGalleryItem>;
  deleteChefGalleryItem(id: string): Promise<void>;
  
  getChefAvailability(chefId: string, startDate?: Date, endDate?: Date): Promise<ChefAvailability[]>;
  setChefAvailability(availability: InsertChefAvailability): Promise<ChefAvailability>;
  
  getVerificationDocuments(chefId: string): Promise<VerificationDocument[]>;
  getPendingVerifications(): Promise<VerificationDocument[]>;
  submitVerificationDocument(doc: InsertVerificationDocument): Promise<VerificationDocument>;
  reviewVerificationDocument(id: string, status: string, reviewedBy: string, notes?: string): Promise<VerificationDocument | undefined>;
  
  getMarkets(): Promise<Market[]>;
  createMarket(market: InsertMarket): Promise<Market>;
  
  getBookings(filters?: {
    customerId?: string;
    chefId?: string;
    status?: string;
  }): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
  
  getReviews(chefId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getCustomerReviews(customerId: string): Promise<Review[]>;
  
  getAdminStats(): Promise<{
    totalUsers: number;
    totalChefs: number;
    totalBookings: number;
    totalRevenue: number;
    pendingVerifications: number;
  }>;
  
  getAllUserRoles(): Promise<UserRole[]>;
  
  getChefMenuItems(chefId: string): Promise<any[]>;
  
  getCustomerFavorites(customerId: string): Promise<ChefProfile[]>;
  addCustomerFavorite(customerId: string, chefId: string): Promise<void>;
  removeCustomerFavorite(customerId: string, chefId: string): Promise<void>;
  
  getPlatformSetting(key: string): Promise<PlatformSetting | undefined>;
  setPlatformSetting(key: string, value: any): Promise<PlatformSetting>;
  getAllPlatformSettings(): Promise<PlatformSetting[]>;
  
  getActivityFeed(limit?: number): Promise<any[]>;
  getUserGrowthAnalytics(period: string): Promise<any[]>;
  getChefPerformanceAnalytics(): Promise<any[]>;
  getPlatformMetrics(): Promise<any>;
  
  getAllReviews(): Promise<Review[]>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
  
  updateMarket(id: string, updates: Partial<Market>): Promise<Market | undefined>;
  deleteMarket(id: string): Promise<void>;
  
  getTransactionHistory(filters?: { type?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getPayoutHistory(): Promise<any[]>;
  
  getUserWithDetails(userId: string): Promise<any>;
  getChefOnboardingPipeline(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async upsertUser(user: Partial<User> & { id: string }): Promise<User> {
    const [result] = await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...user,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getUserStripeCustomerId(userId: string): Promise<string | null> {
    const user = await this.getUser(userId);
    return user?.stripeCustomerId || null;
  }

  async setUserStripeCustomerId(userId: string, customerId: string): Promise<void> {
    await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUserRole(userId: string): Promise<UserRole | undefined> {
    const [role] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);
    return role;
  }

  async setUserRole(userId: string, role: string): Promise<UserRole> {
    const existing = await this.getUserRole(userId);
    if (existing) {
      const [result] = await db
        .update(userRoles)
        .set({ role })
        .where(eq(userRoles.userId, userId))
        .returning();
      return result;
    }
    const [result] = await db
      .insert(userRoles)
      .values({ userId, role })
      .returning();
    return result;
  }

  async getChefs(filters?: {
    search?: string;
    cuisine?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    marketId?: string;
    isActive?: boolean;
  }): Promise<ChefProfile[]> {
    let query = db.select().from(chefProfiles);
    
    const conditions = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(chefProfiles.isActive, filters.isActive));
    } else {
      conditions.push(eq(chefProfiles.isActive, true));
    }
    
    if (filters?.minRating) {
      conditions.push(gte(chefProfiles.averageRating, String(filters.minRating)));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return query.orderBy(desc(chefProfiles.averageRating));
  }

  async getChefById(id: string): Promise<ChefProfile | undefined> {
    const [chef] = await db
      .select()
      .from(chefProfiles)
      .where(eq(chefProfiles.id, id))
      .limit(1);
    return chef;
  }

  async getChefByUserId(userId: string): Promise<ChefProfile | undefined> {
    const [chef] = await db
      .select()
      .from(chefProfiles)
      .where(eq(chefProfiles.userId, userId))
      .limit(1);
    return chef;
  }

  async createChefProfile(profile: InsertChefProfile): Promise<ChefProfile> {
    const [result] = await db.insert(chefProfiles).values(profile).returning();
    return result;
  }

  async updateChefProfile(id: string, updates: Partial<ChefProfile>): Promise<ChefProfile | undefined> {
    const [result] = await db
      .update(chefProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chefProfiles.id, id))
      .returning();
    return result;
  }

  async getChefGallery(chefId: string): Promise<ChefGalleryItem[]> {
    return db
      .select()
      .from(chefGallery)
      .where(eq(chefGallery.chefId, chefId))
      .orderBy(chefGallery.sortOrder);
  }

  async addChefGalleryItem(item: InsertChefGalleryItem): Promise<ChefGalleryItem> {
    const [result] = await db.insert(chefGallery).values(item).returning();
    return result;
  }

  async deleteChefGalleryItem(id: string): Promise<void> {
    await db.delete(chefGallery).where(eq(chefGallery.id, id));
  }

  async getChefAvailability(chefId: string, startDate?: Date, endDate?: Date): Promise<ChefAvailability[]> {
    const conditions = [eq(chefAvailability.chefId, chefId)];
    
    if (startDate) {
      conditions.push(gte(chefAvailability.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(chefAvailability.date, endDate));
    }
    
    return db
      .select()
      .from(chefAvailability)
      .where(and(...conditions))
      .orderBy(chefAvailability.date);
  }

  async setChefAvailability(availability: InsertChefAvailability): Promise<ChefAvailability> {
    const [result] = await db
      .insert(chefAvailability)
      .values(availability)
      .returning();
    return result;
  }

  async getVerificationDocuments(chefId: string): Promise<VerificationDocument[]> {
    return db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.chefId, chefId))
      .orderBy(desc(verificationDocuments.createdAt));
  }

  async getPendingVerifications(): Promise<VerificationDocument[]> {
    return db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.status, "pending"))
      .orderBy(verificationDocuments.createdAt);
  }

  async submitVerificationDocument(doc: InsertVerificationDocument): Promise<VerificationDocument> {
    const [result] = await db
      .insert(verificationDocuments)
      .values(doc)
      .returning();
    return result;
  }

  async reviewVerificationDocument(
    id: string,
    status: string,
    reviewedBy: string,
    notes?: string
  ): Promise<VerificationDocument | undefined> {
    const [result] = await db
      .update(verificationDocuments)
      .set({
        status,
        reviewedBy,
        reviewNotes: notes,
        reviewedAt: new Date(),
      })
      .where(eq(verificationDocuments.id, id))
      .returning();
    return result;
  }

  async getMarkets(): Promise<Market[]> {
    return db.select().from(markets).where(eq(markets.isActive, true));
  }

  async createMarket(market: InsertMarket): Promise<Market> {
    const [result] = await db.insert(markets).values(market).returning();
    return result;
  }

  async getBookings(filters?: {
    customerId?: string;
    chefId?: string;
    status?: string;
  }): Promise<Booking[]> {
    const conditions = [];
    
    if (filters?.customerId) {
      conditions.push(eq(bookings.customerId, filters.customerId));
    }
    if (filters?.chefId) {
      conditions.push(eq(bookings.chefId, filters.chefId));
    }
    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status));
    }
    
    let query = db.select().from(bookings);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return query.orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [result] = await db.insert(bookings).values(booking).returning();
    return result;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const [result] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return result;
  }

  async getReviews(chefId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(and(eq(reviews.chefId, chefId), eq(reviews.isVisible, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    
    const allReviews = await this.getReviews(review.chefId);
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await this.updateChefProfile(review.chefId, {
      averageRating: avgRating.toFixed(2),
      totalReviews: allReviews.length,
    });
    
    return result;
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalChefs: number;
    totalBookings: number;
    totalRevenue: number;
    pendingVerifications: number;
  }> {
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [chefsCount] = await db.select({ count: sql<number>`count(*)` }).from(chefProfiles);
    const [bookingsCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const [revenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(total AS DECIMAL)), 0)` })
      .from(bookings)
      .where(eq(bookings.status, "completed"));
    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationDocuments)
      .where(eq(verificationDocuments.status, "pending"));

    return {
      totalUsers: Number(usersCount?.count || 0),
      totalChefs: Number(chefsCount?.count || 0),
      totalBookings: Number(bookingsCount?.count || 0),
      totalRevenue: Number(revenueResult?.total || 0),
      pendingVerifications: Number(pendingCount?.count || 0),
    };
  }

  async getRevenueAnalytics(period: string): Promise<{ name: string; revenue: number; bookings: number }[]> {
    const now = new Date();
    let data: { name: string; revenue: number; bookings: number }[] = [];

    if (period === "daily") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayBookings = await db
          .select()
          .from(bookings)
          .where(
            and(
              gte(bookings.eventDate, dayStart),
              lte(bookings.eventDate, dayEnd)
            )
          );

        let revenue = 0;
        let bookingCount = 0;
        for (const b of dayBookings) {
          if (b.status === "completed") {
            revenue += parseFloat(b.total || "0");
            bookingCount++;
          } else if (b.status === "cancelled") {
            revenue -= parseFloat(b.total || "0");
          }
        }

        data.push({
          name: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: Math.round(revenue * 100) / 100,
          bookings: bookingCount,
        });
      }
    } else if (period === "monthly") {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthBookings = await db
          .select()
          .from(bookings)
          .where(
            and(
              gte(bookings.eventDate, monthStart),
              lte(bookings.eventDate, monthEnd)
            )
          );

        let revenue = 0;
        let bookingCount = 0;
        for (const b of monthBookings) {
          if (b.status === "completed") {
            revenue += parseFloat(b.total || "0");
            bookingCount++;
          } else if (b.status === "cancelled") {
            revenue -= parseFloat(b.total || "0");
          }
        }

        data.push({
          name: monthStart.toLocaleDateString("en-US", { month: "short" }),
          revenue: Math.round(revenue * 100) / 100,
          bookings: bookingCount,
        });
      }
    } else {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayBookings = await db
          .select()
          .from(bookings)
          .where(
            and(
              gte(bookings.eventDate, dayStart),
              lte(bookings.eventDate, dayEnd)
            )
          );

        let revenue = 0;
        let bookingCount = 0;
        for (const b of dayBookings) {
          if (b.status === "completed") {
            revenue += parseFloat(b.total || "0");
            bookingCount++;
          } else if (b.status === "cancelled") {
            revenue -= parseFloat(b.total || "0");
          }
        }

        data.push({
          name: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: Math.round(revenue * 100) / 100,
          bookings: bookingCount,
        });
      }
    }

    return data;
  }

  async getPlatformSetting(key: string): Promise<PlatformSetting | undefined> {
    const [setting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key))
      .limit(1);
    return setting;
  }

  async setPlatformSetting(key: string, value: any): Promise<PlatformSetting> {
    const [result] = await db
      .insert(platformSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async getCustomerReviews(customerId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.customerId, customerId))
      .orderBy(desc(reviews.createdAt));
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    return db.select().from(userRoles);
  }

  async getChefMenuItems(chefId: string): Promise<any[]> {
    return [];
  }

  async getCustomerFavorites(customerId: string): Promise<ChefProfile[]> {
    return [];
  }

  async addCustomerFavorite(customerId: string, chefId: string): Promise<void> {
  }

  async removeCustomerFavorite(customerId: string, chefId: string): Promise<void> {
  }

  async getAllPlatformSettings(): Promise<PlatformSetting[]> {
    return db.select().from(platformSettings);
  }

  async getActivityFeed(limit: number = 50): Promise<any[]> {
    const activities: any[] = [];
    
    const recentBookings = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(20);
    
    for (const booking of recentBookings) {
      const customer = await this.getUser(booking.customerId);
      const chef = await this.getChefById(booking.chefId);
      activities.push({
        id: `booking-${booking.id}`,
        type: "booking",
        action: booking.status === "completed" ? "completed" : booking.status === "cancelled" ? "cancelled" : "created",
        description: `${customer?.firstName || "Customer"} ${booking.status === "completed" ? "completed booking with" : booking.status === "cancelled" ? "cancelled booking with" : "booked"} ${chef?.displayName || "Chef"}`,
        amount: parseFloat(booking.total || "0"),
        timestamp: booking.createdAt,
        metadata: { bookingId: booking.id, customerId: booking.customerId, chefId: booking.chefId }
      });
    }
    
    const recentUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);
    
    for (const user of recentUsers) {
      activities.push({
        id: `user-${user.id}`,
        type: "user",
        action: "signup",
        description: `${user.firstName} ${user.lastName} joined the platform`,
        timestamp: user.createdAt,
        metadata: { userId: user.id, email: user.email }
      });
    }
    
    const recentChefs = await db
      .select()
      .from(chefProfiles)
      .orderBy(desc(chefProfiles.createdAt))
      .limit(10);
    
    for (const chef of recentChefs) {
      activities.push({
        id: `chef-${chef.id}`,
        type: "chef",
        action: "registered",
        description: `${chef.displayName} registered as a chef`,
        timestamp: chef.createdAt,
        metadata: { chefId: chef.id }
      });
    }
    
    const recentReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt))
      .limit(10);
    
    for (const review of recentReviews) {
      const customer = await this.getUser(review.customerId);
      const chef = await this.getChefById(review.chefId);
      activities.push({
        id: `review-${review.id}`,
        type: "review",
        action: "posted",
        description: `${customer?.firstName || "Customer"} left a ${review.rating}-star review for ${chef?.displayName || "Chef"}`,
        rating: review.rating,
        timestamp: review.createdAt,
        metadata: { reviewId: review.id, chefId: review.chefId, customerId: review.customerId }
      });
    }
    
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, limit);
  }

  async getUserGrowthAnalytics(period: string): Promise<any[]> {
    const data: any[] = [];
    const now = new Date();
    
    if (period === "monthly") {
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        
        const monthUsers = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(gte(users.createdAt, monthStart), lte(users.createdAt, monthEnd)));
        
        const monthChefs = await db
          .select({ count: sql<number>`count(*)` })
          .from(chefProfiles)
          .where(and(gte(chefProfiles.createdAt, monthStart), lte(chefProfiles.createdAt, monthEnd)));
        
        data.push({
          name: monthStart.toLocaleDateString("en-US", { month: "short" }),
          users: Number(monthUsers[0]?.count || 0),
          chefs: Number(monthChefs[0]?.count || 0),
        });
      }
    } else {
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayUsers = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(gte(users.createdAt, dayStart), lte(users.createdAt, dayEnd)));
        
        const dayChefs = await db
          .select({ count: sql<number>`count(*)` })
          .from(chefProfiles)
          .where(and(gte(chefProfiles.createdAt, dayStart), lte(chefProfiles.createdAt, dayEnd)));
        
        data.push({
          name: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          users: Number(dayUsers[0]?.count || 0),
          chefs: Number(dayChefs[0]?.count || 0),
        });
      }
    }
    
    return data;
  }

  async getChefPerformanceAnalytics(): Promise<any[]> {
    const allChefs = await db.select().from(chefProfiles).where(eq(chefProfiles.isActive, true));
    const performance: any[] = [];
    
    for (const chef of allChefs) {
      const chefBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.chefId, chef.id));
      
      const completedBookings = chefBookings.filter(b => b.status === "completed");
      const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(b.total || "0"), 0);
      
      performance.push({
        id: chef.id,
        displayName: chef.displayName,
        profileImageUrl: chef.profileImageUrl,
        averageRating: parseFloat(chef.averageRating || "0"),
        totalReviews: chef.totalReviews || 0,
        completedBookings: completedBookings.length,
        totalRevenue,
        verificationLevel: chef.verificationLevel,
        isCertified: chef.isCertified,
        stripeConnectOnboarded: chef.stripeConnectOnboarded,
      });
    }
    
    performance.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return performance;
  }

  async getPlatformMetrics(): Promise<any> {
    const allBookings = await db.select().from(bookings);
    const allUsers = await db.select().from(users);
    const allChefs = await db.select().from(chefProfiles);
    
    const completedBookings = allBookings.filter(b => b.status === "completed");
    const cancelledBookings = allBookings.filter(b => b.status === "cancelled");
    const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(b.total || "0"), 0);
    const totalFees = completedBookings.reduce((sum, b) => sum + parseFloat(b.serviceFee || "0"), 0);
    
    const avgOrderValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
    const conversionRate = allBookings.length > 0 ? (completedBookings.length / allBookings.length) * 100 : 0;
    const cancellationRate = allBookings.length > 0 ? (cancelledBookings.length / allBookings.length) * 100 : 0;
    
    const chefsOnboarded = allChefs.filter(c => c.stripeConnectOnboarded).length;
    const chefsPending = allChefs.filter(c => !c.stripeConnectOnboarded).length;
    
    return {
      totalRevenue,
      platformFees: totalFees,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      totalUsers: allUsers.length,
      totalChefs: allChefs.length,
      activeChefs: allChefs.filter(c => c.isActive).length,
      chefsOnboarded,
      chefsPending,
      totalBookings: allBookings.length,
      completedBookings: completedBookings.length,
      pendingBookings: allBookings.filter(b => b.status === "requested" || b.status === "accepted").length,
    };
  }

  async getAllReviews(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async updateMarket(id: string, updates: Partial<Market>): Promise<Market | undefined> {
    const [updated] = await db
      .update(markets)
      .set(updates)
      .where(eq(markets.id, id))
      .returning();
    return updated;
  }

  async deleteMarket(id: string): Promise<void> {
    await db.delete(markets).where(eq(markets.id, id));
  }

  async getTransactionHistory(filters?: { type?: string; startDate?: Date; endDate?: Date }): Promise<any[]> {
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    const transactions: any[] = [];
    
    for (const booking of allBookings) {
      const customer = await this.getUser(booking.customerId);
      const chef = await this.getChefById(booking.chefId);
      
      if (booking.paymentStatus === "completed" || booking.status === "completed") {
        transactions.push({
          id: `payment-${booking.id}`,
          type: "payment",
          bookingId: booking.id,
          customerName: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Unknown",
          chefName: chef?.displayName || "Unknown",
          amount: parseFloat(booking.total || "0"),
          fee: parseFloat(booking.serviceFee || "0"),
          chefPayout: parseFloat(booking.chefPayout || "0"),
          status: booking.paymentStatus,
          date: booking.createdAt,
        });
      }
      
      if (booking.status === "cancelled") {
        transactions.push({
          id: `refund-${booking.id}`,
          type: "refund",
          bookingId: booking.id,
          customerName: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Unknown",
          chefName: chef?.displayName || "Unknown",
          amount: -parseFloat(booking.total || "0"),
          fee: 0,
          chefPayout: 0,
          status: "refunded",
          date: booking.updatedAt,
        });
      }
    }
    
    if (filters?.type && filters.type !== "all") {
      return transactions.filter(t => t.type === filters.type);
    }
    
    return transactions;
  }

  async getPayoutHistory(): Promise<any[]> {
    const paidBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.payoutStatus, "paid"))
      .orderBy(desc(bookings.updatedAt));
    
    const payouts: any[] = [];
    
    for (const booking of paidBookings) {
      const chef = await this.getChefById(booking.chefId);
      payouts.push({
        id: `payout-${booking.id}`,
        bookingId: booking.id,
        chefId: booking.chefId,
        chefName: chef?.displayName || "Unknown",
        amount: parseFloat(booking.chefPayout || booking.subtotal || "0"),
        date: booking.updatedAt,
        status: "completed",
      });
    }
    
    return payouts;
  }

  async getUserWithDetails(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    const role = await this.getUserRole(userId);
    const userBookings = await this.getBookings({ customerId: userId });
    const chefProfile = await this.getChefByUserId(userId);
    
    const totalSpent = userBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.total || "0"), 0);
    
    return {
      ...user,
      role: role?.role || "customer",
      totalBookings: userBookings.length,
      completedBookings: userBookings.filter(b => b.status === "completed").length,
      totalSpent,
      recentBookings: userBookings.slice(0, 5),
      chefProfile,
    };
  }

  async getChefOnboardingPipeline(): Promise<any[]> {
    const allChefs = await db.select().from(chefProfiles).orderBy(desc(chefProfiles.createdAt));
    const pipeline: any[] = [];
    
    for (const chef of allChefs) {
      const user = await this.getUser(chef.userId);
      const verifications = await this.getVerificationDocuments(chef.id);
      
      let stage = "profile_created";
      if (verifications.length > 0 && verifications.some(v => v.status === "pending")) {
        stage = "documents_pending";
      } else if (verifications.some(v => v.status === "approved")) {
        stage = "verified";
      }
      if (chef.stripeConnectOnboarded) {
        stage = "onboarded";
      }
      if (!chef.isActive) {
        stage = "suspended";
      }
      
      pipeline.push({
        id: chef.id,
        userId: chef.userId,
        displayName: chef.displayName,
        email: user?.email,
        profileImageUrl: chef.profileImageUrl,
        stage,
        verificationLevel: chef.verificationLevel,
        isCertified: chef.isCertified,
        stripeConnectOnboarded: chef.stripeConnectOnboarded,
        isActive: chef.isActive,
        createdAt: chef.createdAt,
        documentsCount: verifications.length,
        pendingDocuments: verifications.filter(v => v.status === "pending").length,
      });
    }
    
    return pipeline;
  }
}

export const storage = new DatabaseStorage();

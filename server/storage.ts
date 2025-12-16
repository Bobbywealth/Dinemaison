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
}

export const storage = new DatabaseStorage();

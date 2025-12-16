import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// ============== CHEF PROFILES ==============
export const chefProfiles = pgTable("chef_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  yearsExperience: integer("years_experience").default(0),
  profileImageUrl: varchar("profile_image_url"),
  coverImageUrl: varchar("cover_image_url"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  minimumSpend: decimal("minimum_spend", { precision: 10, scale: 2 }).default("250"),
  minimumGuests: integer("minimum_guests").default(2),
  maximumGuests: integer("maximum_guests").default(12),
  cuisines: text("cuisines").array(),
  dietarySpecialties: text("dietary_specialties").array(),
  servicesOffered: text("services_offered").array(),
  verificationLevel: varchar("verification_level").default("basic"),
  isCertified: boolean("is_certified").default(false),
  isActive: boolean("is_active").default(true),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("15"),
  stripeConnectAccountId: varchar("stripe_connect_account_id"),
  stripeConnectOnboarded: boolean("stripe_connect_onboarded").default(false),
  completedBookings: integer("completed_bookings").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChefProfileSchema = createInsertSchema(chefProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedBookings: true,
  averageRating: true,
  totalReviews: true,
});

export type InsertChefProfile = z.infer<typeof insertChefProfileSchema>;
export type ChefProfile = typeof chefProfiles.$inferSelect;

// ============== CHEF GALLERY ==============
export const chefGallery = pgTable("chef_gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chefId: varchar("chef_id").notNull(),
  imageUrl: varchar("image_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChefGallerySchema = createInsertSchema(chefGallery).omit({
  id: true,
  createdAt: true,
});

export type InsertChefGalleryItem = z.infer<typeof insertChefGallerySchema>;
export type ChefGalleryItem = typeof chefGallery.$inferSelect;

// ============== CHEF AVAILABILITY ==============
export const chefAvailability = pgTable("chef_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chefId: varchar("chef_id").notNull(),
  date: timestamp("date").notNull(),
  isAvailable: boolean("is_available").default(true),
  startTime: varchar("start_time"),
  endTime: varchar("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChefAvailabilitySchema = createInsertSchema(chefAvailability).omit({
  id: true,
  createdAt: true,
});

export type InsertChefAvailability = z.infer<typeof insertChefAvailabilitySchema>;
export type ChefAvailability = typeof chefAvailability.$inferSelect;

// ============== VERIFICATION DOCUMENTS ==============
export const verificationDocuments = pgTable("verification_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chefId: varchar("chef_id").notNull(),
  documentType: varchar("document_type").notNull(),
  documentUrl: varchar("document_url").notNull(),
  status: varchar("status").default("pending"),
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;

// ============== MARKETS ==============
export const markets = pgTable("markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketSchema = createInsertSchema(markets).omit({
  id: true,
  createdAt: true,
});

export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type Market = typeof markets.$inferSelect;

// ============== CHEF MARKETS (junction) ==============
export const chefMarkets = pgTable("chef_markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chefId: varchar("chef_id").notNull(),
  marketId: varchar("market_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============== BOOKINGS ==============
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  chefId: varchar("chef_id").notNull(),
  marketId: varchar("market_id"),
  eventDate: timestamp("event_date").notNull(),
  eventTime: varchar("event_time").notNull(),
  guestCount: integer("guest_count").notNull(),
  eventAddress: text("event_address").notNull(),
  specialRequests: text("special_requests"),
  services: text("services").array(),
  status: varchar("status").default("requested"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default("0"),
  tip: decimal("tip", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  paymentStatus: varchar("payment_status").default("pending"),
  chefPayout: decimal("chef_payout", { precision: 10, scale: 2 }),
  payoutStatus: varchar("payout_status").default("pending"),
  assignedByAdmin: boolean("assigned_by_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// ============== BOOKING STATUS EVENTS ==============
export const bookingStatusEvents = pgTable("booking_status_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  status: varchar("status").notNull(),
  note: text("note"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============== REVIEWS ==============
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  chefId: varchar("chef_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVisible: boolean("is_visible").default(true),
  isFlagged: boolean("is_flagged").default(false),
  flagReason: text("flag_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// ============== PLATFORM SETTINGS ==============
export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: jsonb("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;

// ============== USER ROLES ==============
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  role: varchar("role").notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// ============== RELATIONS ==============
export const chefProfilesRelations = relations(chefProfiles, ({ many }) => ({
  gallery: many(chefGallery),
  availability: many(chefAvailability),
  verificationDocuments: many(verificationDocuments),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const chefGalleryRelations = relations(chefGallery, ({ one }) => ({
  chef: one(chefProfiles, {
    fields: [chefGallery.chefId],
    references: [chefProfiles.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  chef: one(chefProfiles, {
    fields: [bookings.chefId],
    references: [chefProfiles.id],
  }),
  statusEvents: many(bookingStatusEvents),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  chef: one(chefProfiles, {
    fields: [reviews.chefId],
    references: [chefProfiles.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

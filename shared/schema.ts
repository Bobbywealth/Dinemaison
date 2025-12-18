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

// ============== MENU ITEMS ==============
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chefId: varchar("chef_id").notNull().references(() => chefProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 100 }),
  dietaryInfo: text("dietary_info").array(),
  imageUrl: varchar("image_url"),
  isAvailable: boolean("is_available").default(true),
  prepTime: integer("prep_time"),
  servingSize: integer("serving_size"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  chefIdIdx: index("menu_items_chef_id_idx").on(table.chefId),
}));

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  chef: one(chefProfiles, {
    fields: [menuItems.chefId],
    references: [chefProfiles.id],
  }),
}));

// ============== PUSH SUBSCRIPTIONS ==============
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("push_subscriptions_user_id_idx").on(table.userId),
  endpointIdx: index("push_subscriptions_endpoint_idx").on(table.endpoint),
}));

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;

// ============== NOTIFICATIONS ==============
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // booking_requested, booking_confirmed, etc.
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data").default({}),
  category: varchar("category").default("system"), // booking, payment, message, system
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  typeIdx: index("notifications_type_idx").on(table.type),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ============== NOTIFICATION PREFERENCES ==============
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  notificationType: varchar("notification_type").notNull(),
  channelPush: boolean("channel_push").default(true),
  channelEmail: boolean("channel_email").default(true),
  channelSms: boolean("channel_sms").default(false),
  channelInApp: boolean("channel_in_app").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notification_preferences_user_id_idx").on(table.userId),
  userTypeIdx: index("notification_preferences_user_type_idx").on(table.userId, table.notificationType),
}));

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  updatedAt: true,
});

export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;

// ============== DEVICE TOKENS ==============
export const deviceTokens = pgTable("device_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  platform: varchar("platform").notNull(), // ios, android, web
  token: text("token").notNull(),
  deviceId: varchar("device_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("device_tokens_user_id_idx").on(table.userId),
  tokenIdx: index("device_tokens_token_idx").on(table.token),
  platformIdx: index("device_tokens_platform_idx").on(table.platform),
}));

export const insertDeviceTokenSchema = createInsertSchema(deviceTokens).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export type InsertDeviceToken = z.infer<typeof insertDeviceTokenSchema>;
export type DeviceToken = typeof deviceTokens.$inferSelect;

// ============== NOTIFICATION DELIVERY LOG ==============
export const notificationDeliveryLog = pgTable("notification_delivery_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationId: varchar("notification_id"),
  channel: varchar("channel").notNull(), // push, email, sms, websocket, in_app
  status: varchar("status").default("pending"), // pending, sent, failed, delivered
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow(),
}, (table) => ({
  notificationIdIdx: index("notification_delivery_log_notification_id_idx").on(table.notificationId),
  channelIdx: index("notification_delivery_log_channel_idx").on(table.channel),
  statusIdx: index("notification_delivery_log_status_idx").on(table.status),
}));

export const insertNotificationDeliveryLogSchema = createInsertSchema(notificationDeliveryLog).omit({
  id: true,
  sentAt: true,
});

export type InsertNotificationDeliveryLog = z.infer<typeof insertNotificationDeliveryLogSchema>;
export type NotificationDeliveryLog = typeof notificationDeliveryLog.$inferSelect;

// ============== TASKS ==============
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("todo"), // todo, in_progress, review, done
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, urgent
  assignedTo: varchar("assigned_to"),
  createdBy: varchar("created_by").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("tasks_status_idx").on(table.status),
  assignedToIdx: index("tasks_assigned_to_idx").on(table.assignedTo),
  createdByIdx: index("tasks_created_by_idx").on(table.createdBy),
  dueDateIdx: index("tasks_due_date_idx").on(table.dueDate),
  createdAtIdx: index("tasks_created_at_idx").on(table.createdAt),
}));

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// ============== TASK COMMENTS ==============
export const taskComments = pgTable("task_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(),
  userId: varchar("user_id").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  taskIdIdx: index("task_comments_task_id_idx").on(table.taskId),
  createdAtIdx: index("task_comments_created_at_idx").on(table.createdAt),
}));

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
});

export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;
export type TaskComment = typeof taskComments.$inferSelect;

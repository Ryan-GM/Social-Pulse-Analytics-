import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  reportFrequency: text("report_frequency").default("weekly"), // daily, weekly, manual
  reportFormat: text("report_format").default("pdf"), // pdf, csv
  reportEmail: text("report_email"),
  autoSyncInterval: integer("auto_sync_interval").default(24), // hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  platform: text("platform").notNull(), // instagram, twitter, tiktok, facebook, youtube
  accountId: text("account_id").notNull(),
  username: text("username").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const platformMetrics = pgTable("platform_metrics", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => socialAccounts.id),
  platform: text("platform").notNull(),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  engagementRate: real("engagement_rate").default(0),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  date: timestamp("date").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => socialAccounts.id),
  platform: text("platform").notNull(),
  postId: text("post_id").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  views: integer("views").default(0),
  engagementRate: real("engagement_rate").default(0),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  reportType: text("report_type").notNull(), // weekly, monthly, custom
  title: text("title").notNull(),
  data: json("data"), // JSON data for the report
  dateRange: json("date_range"), // start and end dates
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformMetricsSchema = createInsertSchema(platformMetrics).omit({
  id: true,
  date: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type PlatformMetrics = typeof platformMetrics.$inferSelect;
export type InsertPlatformMetrics = z.infer<typeof insertPlatformMetricsSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

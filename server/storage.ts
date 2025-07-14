import { users, socialAccounts, platformMetrics, posts, reports, type User, type InsertUser, type SocialAccount, type InsertSocialAccount, type PlatformMetrics, type InsertPlatformMetrics, type Post, type InsertPost, type Report, type InsertReport } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Social account operations
  getSocialAccounts(userId: number): Promise<SocialAccount[]>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: number, account: Partial<SocialAccount>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: number): Promise<boolean>;
  
  // Platform metrics operations
  getPlatformMetrics(accountId: number, days?: number): Promise<PlatformMetrics[]>;
  createPlatformMetrics(metrics: InsertPlatformMetrics): Promise<PlatformMetrics>;
  getLatestMetrics(accountId: number): Promise<PlatformMetrics | undefined>;
  
  // Posts operations
  getTopPosts(accountId: number, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  getPostsByPlatform(platform: string, limit?: number): Promise<Post[]>;
  
  // Reports operations
  getReports(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    return await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId));
  }

  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const [account] = await db
      .insert(socialAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateSocialAccount(id: number, updates: Partial<SocialAccount>): Promise<SocialAccount | undefined> {
    const [account] = await db
      .update(socialAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(socialAccounts.id, id))
      .returning();
    return account;
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    const result = await db
      .delete(socialAccounts)
      .where(eq(socialAccounts.id, id));
    return result.rowCount > 0;
  }

  async getPlatformMetrics(accountId: number, days = 7): Promise<PlatformMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db
      .select()
      .from(platformMetrics)
      .where(
        and(
          eq(platformMetrics.accountId, accountId),
          gte(platformMetrics.date, cutoffDate)
        )
      )
      .orderBy(platformMetrics.date);
  }

  async createPlatformMetrics(insertMetrics: InsertPlatformMetrics): Promise<PlatformMetrics> {
    const [metrics] = await db
      .insert(platformMetrics)
      .values(insertMetrics)
      .returning();
    return metrics;
  }

  async getLatestMetrics(accountId: number): Promise<PlatformMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(platformMetrics)
      .where(eq(platformMetrics.accountId, accountId))
      .orderBy(desc(platformMetrics.date))
      .limit(1);
    return metrics;
  }

  async getTopPosts(accountId: number, limit = 10): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.accountId, accountId))
      .orderBy(desc(posts.likes))
      .limit(limit);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getPostsByPlatform(platform: string, limit = 10): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.platform, platform))
      .orderBy(desc(posts.likes))
      .limit(limit);
  }

  async getReports(userId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private socialAccounts: Map<number, SocialAccount> = new Map();
  private platformMetrics: Map<number, PlatformMetrics> = new Map();
  private posts: Map<number, Post> = new Map();
  private reports: Map<number, Report> = new Map();
  
  private currentUserId = 1;
  private currentAccountId = 1;
  private currentMetricsId = 1;
  private currentPostId = 1;
  private currentReportId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create demo user
    const demoUser: User = {
      id: this.currentUserId++,
      username: "demo",
      password: "password",
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo social accounts
    const platforms = [
      { platform: "instagram", username: "@yourhandle", accountId: "ig_123" },
      { platform: "twitter", username: "@yourhandle", accountId: "tw_456" },
      { platform: "tiktok", username: "@yourhandle", accountId: "tt_789" },
      { platform: "facebook", username: "@yourpage", accountId: "fb_012" },
    ];

    const socialAccountsData: SocialAccount[] = [];
    platforms.forEach(p => {
      const account: SocialAccount = {
        id: this.currentAccountId++,
        userId: demoUser.id,
        platform: p.platform,
        accountId: p.accountId,
        username: p.username,
        accessToken: "demo_token",
        refreshToken: "demo_refresh",
        isActive: true,
        createdAt: new Date(),
      };
      this.socialAccounts.set(account.id, account);
      socialAccountsData.push(account);
    });

    // Create demo metrics for the last 7 days
    const today = new Date();
    const metricsData = {
      instagram: { followers: 45234, following: 1234, engagementRate: 6.2, impressions: 789000, reach: 589000 },
      twitter: { followers: 28567, following: 897, engagementRate: 3.8, impressions: 445000, reach: 334000 },
      tiktok: { followers: 32891, following: 456, engagementRate: 8.4, impressions: 1200000, reach: 890000 },
      facebook: { followers: 17897, following: 234, engagementRate: 2.1, impressions: 234000, reach: 178000 },
    };

    socialAccountsData.forEach(account => {
      const baseMetrics = metricsData[account.platform as keyof typeof metricsData];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const variationFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
        const metrics: PlatformMetrics = {
          id: this.currentMetricsId++,
          accountId: account.id,
          platform: account.platform,
          followers: Math.floor(baseMetrics.followers * variationFactor),
          following: baseMetrics.following,
          engagementRate: baseMetrics.engagementRate * variationFactor,
          impressions: Math.floor(baseMetrics.impressions * variationFactor),
          reach: Math.floor(baseMetrics.reach * variationFactor),
          date: date,
        };
        this.platformMetrics.set(metrics.id, metrics);
      }
    });

    // Create demo posts
    const demoPosts = [
      {
        platform: "instagram",
        content: "Amazing sunset from yesterday's hike!",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        likes: 2547,
        comments: 89,
        shares: 45,
        views: 45200,
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        platform: "twitter",
        content: "Productivity tips for remote workers",
        imageUrl: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        likes: 1892,
        comments: 156,
        shares: 89,
        views: 28700,
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        platform: "tiktok",
        content: "Trying out the new restaurant downtown",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        likes: 3421,
        comments: 234,
        shares: 167,
        views: 67400,
        postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    demoPosts.forEach(postData => {
      const account = socialAccountsData.find(a => a.platform === postData.platform);
      if (account) {
        const post: Post = {
          id: this.currentPostId++,
          accountId: account.id,
          platform: postData.platform,
          postId: `${postData.platform}_${Date.now()}`,
          content: postData.content,
          imageUrl: postData.imageUrl,
          likes: postData.likes,
          comments: postData.comments,
          shares: postData.shares,
          views: postData.views,
          engagementRate: ((postData.likes + postData.comments + postData.shares) / postData.views) * 100,
          postedAt: postData.postedAt,
          createdAt: new Date(),
        };
        this.posts.set(post.id, post);
      }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values()).filter(account => account.userId === userId);
  }

  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const account: SocialAccount = {
      id: this.currentAccountId++,
      ...insertAccount,
      createdAt: new Date(),
    };
    this.socialAccounts.set(account.id, account);
    return account;
  }

  async updateSocialAccount(id: number, updates: Partial<SocialAccount>): Promise<SocialAccount | undefined> {
    const account = this.socialAccounts.get(id);
    if (account) {
      const updatedAccount = { ...account, ...updates, updatedAt: new Date() };
      this.socialAccounts.set(id, updatedAccount);
      return updatedAccount;
    }
    return undefined;
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    return this.socialAccounts.delete(id);
  }

  async getPlatformMetrics(accountId: number, days = 7): Promise<PlatformMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.platformMetrics.values())
      .filter(metric => metric.accountId === accountId && metric.date && metric.date >= cutoffDate)
      .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
  }

  async createPlatformMetrics(insertMetrics: InsertPlatformMetrics): Promise<PlatformMetrics> {
    const metrics: PlatformMetrics = {
      id: this.currentMetricsId++,
      ...insertMetrics,
      date: new Date(),
    };
    this.platformMetrics.set(metrics.id, metrics);
    return metrics;
  }

  async getLatestMetrics(accountId: number): Promise<PlatformMetrics | undefined> {
    const metrics = Array.from(this.platformMetrics.values())
      .filter(metric => metric.accountId === accountId)
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    
    return metrics[0];
  }

  async getTopPosts(accountId: number, limit = 10): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.accountId === accountId)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, limit);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const post: Post = {
      id: this.currentPostId++,
      ...insertPost,
      createdAt: new Date(),
    };
    this.posts.set(post.id, post);
    return post;
  }

  async getPostsByPlatform(platform: string, limit = 10): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.platform === platform)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, limit);
  }

  async getReports(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const report: Report = {
      id: this.currentReportId++,
      ...insertReport,
      createdAt: new Date(),
    };
    this.reports.set(report.id, report);
    return report;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }
}

export const storage = new DatabaseStorage();

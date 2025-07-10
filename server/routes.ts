import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard overview data
  app.get("/api/dashboard/overview", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const accounts = await storage.getSocialAccounts(userId);
      
      let totalFollowers = 0;
      let totalImpressions = 0;
      let totalEngagement = 0;
      let activePlatforms = 0;
      
      const platformStats = [];
      
      for (const account of accounts) {
        const latestMetrics = await storage.getLatestMetrics(account.id);
        if (latestMetrics) {
          totalFollowers += latestMetrics.followers || 0;
          totalImpressions += latestMetrics.impressions || 0;
          totalEngagement += latestMetrics.engagementRate || 0;
          activePlatforms++;
          
          platformStats.push({
            platform: account.platform,
            username: account.username,
            followers: latestMetrics.followers,
            engagement: latestMetrics.engagementRate,
            impressions: latestMetrics.impressions,
            reach: latestMetrics.reach,
          });
        }
      }
      
      const avgEngagement = activePlatforms > 0 ? totalEngagement / activePlatforms : 0;
      
      res.json({
        totalFollowers,
        engagementRate: avgEngagement,
        totalImpressions,
        activePlatforms,
        platformStats,
      });
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      res.status(500).json({ error: "Failed to fetch dashboard overview" });
    }
  });

  // Follower growth data
  app.get("/api/dashboard/follower-growth", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const days = parseInt(req.query.days as string) || 7;
      const accounts = await storage.getSocialAccounts(userId);
      
      const growthData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        let dayTotal = 0;
        
        for (const account of accounts) {
          const metrics = await storage.getPlatformMetrics(account.id, days);
          const dayMetrics = metrics.find(m => 
            m.date?.toDateString() === date.toDateString()
          );
          
          if (dayMetrics) {
            dayTotal += dayMetrics.followers || 0;
          }
        }
        
        growthData.push({
          date: date.toISOString().split('T')[0],
          followers: dayTotal,
        });
      }
      
      res.json(growthData);
    } catch (error) {
      console.error("Error fetching follower growth:", error);
      res.status(500).json({ error: "Failed to fetch follower growth data" });
    }
  });

  // Platform distribution
  app.get("/api/dashboard/platform-distribution", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const accounts = await storage.getSocialAccounts(userId);
      
      const distribution: { [key: string]: number } = {};
      let total = 0;
      
      for (const account of accounts) {
        const latestMetrics = await storage.getLatestMetrics(account.id);
        if (latestMetrics) {
          const followers = latestMetrics.followers || 0;
          distribution[account.platform] = followers;
          total += followers;
        }
      }
      
      // Convert to percentages
      const percentages: { [key: string]: number } = {};
      for (const [platform, count] of Object.entries(distribution)) {
        percentages[platform] = total > 0 ? (count / total) * 100 : 0;
      }
      
      res.json(percentages);
    } catch (error) {
      console.error("Error fetching platform distribution:", error);
      res.status(500).json({ error: "Failed to fetch platform distribution" });
    }
  });

  // Top performing posts
  app.get("/api/dashboard/top-posts", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const limit = parseInt(req.query.limit as string) || 10;
      const accounts = await storage.getSocialAccounts(userId);
      
      const allPosts = [];
      
      for (const account of accounts) {
        const posts = await storage.getTopPosts(account.id, limit);
        const postsWithAccount = posts.map(post => ({
          ...post,
          platformName: account.platform,
          username: account.username,
        }));
        allPosts.push(...postsWithAccount);
      }
      
      // Sort by engagement (likes + comments + shares) and take top posts
      allPosts.sort((a, b) => {
        const aEngagement = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
        const bEngagement = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);
        return bEngagement - aEngagement;
      });
      
      res.json(allPosts.slice(0, limit));
    } catch (error) {
      console.error("Error fetching top posts:", error);
      res.status(500).json({ error: "Failed to fetch top posts" });
    }
  });

  // Generate report
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { reportType, title, dateRange } = req.body;
      const userId = 1; // Demo user ID
      
      // Get dashboard data for the report
      const accounts = await storage.getSocialAccounts(userId);
      const reportData = {
        accounts: accounts.length,
        totalFollowers: 0,
        totalImpressions: 0,
        generatedAt: new Date().toISOString(),
      };
      
      for (const account of accounts) {
        const latestMetrics = await storage.getLatestMetrics(account.id);
        if (latestMetrics) {
          reportData.totalFollowers += latestMetrics.followers || 0;
          reportData.totalImpressions += latestMetrics.impressions || 0;
        }
      }
      
      const report = await storage.createReport({
        userId,
        reportType,
        title,
        data: reportData,
        dateRange,
      });
      
      res.json({ success: true, reportId: report.id });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const reports = await storage.getReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

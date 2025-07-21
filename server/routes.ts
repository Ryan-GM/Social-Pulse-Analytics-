import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SocialMediaService } from "./services/socialMediaService";
import { ReportService } from "./services/reportService";
import { OAuthService } from "./services/oauthService";
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
      const { reportType, dateRange } = req.body;
      const userId = 1; // Demo user ID
      
      // Generate comprehensive report using ReportService
      const report = await ReportService.generateReport(userId, reportType, dateRange);
      
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Export report
  app.get("/api/reports/:id/export", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const format = req.query.format as string || 'json';
      
      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      switch (format) {
        case 'csv':
          const csvData = await ReportService.exportReportToCSV(report);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.csv"`);
          res.send(csvData);
          break;
          
        case 'pdf':
          const pdfBuffer = await ReportService.exportReportToPDF(report);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.pdf"`);
          res.send(pdfBuffer);
          break;
          
        case 'json':
        default:
          const jsonData = await ReportService.exportReportToJSON(report);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.json"`);
          res.send(jsonData);
          break;
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      res.status(500).json({ error: "Failed to export report" });
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

  // User settings routes
  app.get("/api/user/settings", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const user = await storage.getUser(userId);
      
      if (!user) {
        // Create demo user if doesn't exist
        const demoUser = await storage.createUser({
          username: "demo",
          password: "password",
        });
        return res.json(demoUser);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ error: "Failed to fetch user settings" });
    }
  });

  app.put("/api/user/settings", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const updates = req.body;
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ error: "Failed to update user settings" });
    }
  });

  // Social accounts routes
  app.get("/api/social-accounts", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const accounts = await storage.getSocialAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({ error: "Failed to fetch social accounts" });
    }
  });

  app.post("/api/social-accounts/:id/sync", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      
      // For demo purposes, simulate sync
      await storage.updateSocialAccount(accountId, {
        lastSync: new Date(),
      });
      
      res.json({ success: true, message: "Account synced successfully" });
    } catch (error) {
      console.error("Error syncing account:", error);
      res.status(500).json({ error: "Failed to sync account" });
    }
  });

  app.delete("/api/social-accounts/:id", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      
      const success = await storage.deleteSocialAccount(accountId);
      if (!success) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      res.json({ success: true, message: "Account disconnected successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to disconnect account" });
    }
  });

  // OAuth routes
  app.get("/api/oauth/:platform", async (req, res) => {
    try {
      const { platform } = req.params;
      
      // Validate platform support
      if (!OAuthService.validatePlatformConfig(platform)) {
        return res.redirect(`/settings?error=unsupported_platform&platform=${platform}`);
      }
      
      // Get authorization URL
      const authUrl = OAuthService.getAuthorizationUrl(platform);
      res.redirect(authUrl);
    } catch (error) {
      console.error(`OAuth initiation error for ${req.params.platform}:`, error);
      res.redirect(`/settings?error=oauth_init_failed&platform=${req.params.platform}`);
    }
  });

  app.get("/api/oauth/:platform/callback", async (req, res) => {
    const { platform } = req.params;
    const { code, error, error_description, state } = req.query;
    
    try {
      // Handle OAuth errors
      if (error) {
        console.error(`OAuth error for ${platform}:`, error, error_description);
        return res.redirect(`/settings?error=oauth_denied&platform=${platform}&details=${error_description || error}`);
      }
      
      if (!code) {
        console.error(`Authorization code missing for ${platform}`);
        return res.redirect(`/settings?error=missing_code&platform=${platform}`);
      }
      
      // Exchange code for access token
      const tokens = await OAuthService.exchangeCodeForTokens(platform, code as string, state as string);
      
      if (!tokens.accessToken) {
        console.error(`No access token received for ${platform}`);
        return res.redirect(`/settings?error=no_token&platform=${platform}`);
      }
      
      // Get user info to validate token and get username
      const userInfo = await OAuthService.getUserInfo(platform, tokens.accessToken);
      
      // Extract username from user info based on platform
      let username = `@${platform}_user`;
      switch (platform) {
        case 'instagram':
          username = `@${userInfo.username || userInfo.id}`;
          break;
        case 'twitter':
          username = `@${userInfo.data?.username || userInfo.username || userInfo.id}`;
          break;
        case 'facebook':
          username = userInfo.name || userInfo.id;
          break;
        case 'tiktok':
          username = `@${userInfo.data?.display_name || userInfo.data?.username || userInfo.data?.user?.display_name}`;
          break;
        case 'youtube':
          username = userInfo.name || userInfo.email;
          break;
      }
      
      // Calculate token expiry
      const tokenExpiry = tokens.expiresIn 
        ? new Date(Date.now() + tokens.expiresIn * 1000)
        : new Date(Date.now() + 3600000); // Default 1 hour
      
      // Store the account
      await storage.createSocialAccount({
        userId: 1, // Demo user ID - in production, get from session
        platform,
        accountId: userInfo.id || `${platform}_${Date.now()}`,
        username,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry,
        isActive: true,
      });
      
      console.log(`Successfully connected ${platform} account: ${username}`);
      
      // Redirect back to settings with success
      res.redirect(`/settings?connected=${platform}&username=${encodeURIComponent(username)}`);
    } catch (error) {
      console.error(`OAuth callback error for ${platform}:`, error);
      res.redirect(`/settings?error=connection_failed&platform=${platform}&details=${encodeURIComponent((error as Error).message || 'Unknown error')}`);
    }
      });

    // Add route to manually refresh tokens
    app.post("/api/social-accounts/:id/refresh-token", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const accounts = await storage.getSocialAccounts(1); // Demo user
      const account = accounts.find(a => a.id === accountId);
      
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      if (!account.accessToken) {
        return res.status(400).json({ error: "No access token to refresh" });
      }
      
      // Validate current token
      const isValid = await OAuthService.validateAccessToken(account.platform, account.accessToken);
      
      if (!isValid && account.refreshToken) {
        // Try to refresh the token using the social media service
        const service = SocialMediaService.createPlatformService(
          account.platform, 
          account.accessToken, 
          account.refreshToken
        );
        
        try {
          const newToken = await service.refreshAccessToken();
          
          // Update the stored token
          await storage.updateSocialAccount(accountId, {
            accessToken: newToken,
            lastSync: new Date(),
          });
          
          res.json({ success: true, message: "Token refreshed successfully" });
        } catch (refreshError) {
                     console.error(`Token refresh failed for ${account.platform}:`, refreshError);
           res.status(400).json({ 
             error: "Token refresh failed", 
             details: (refreshError as Error).message || 'Unknown error',
             requiresReauth: true 
           });
        }
      } else if (isValid) {
        res.json({ success: true, message: "Token is still valid" });
      } else {
        res.status(400).json({ 
          error: "Token expired and no refresh token available", 
          requiresReauth: true 
        });
      }
         } catch (error) {
       console.error("Token refresh error:", error);
       res.status(500).json({ error: "Failed to refresh token" });
     }
   });

  const httpServer = createServer(app);
  return httpServer;
}

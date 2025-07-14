import { storage } from "../storage";
import { Report, InsertReport } from "@shared/schema";

export interface ReportData {
  overview: {
    totalFollowers: number;
    engagementRate: number;
    totalImpressions: number;
    activePlatforms: number;
  };
  platformStats: Array<{
    platform: string;
    username: string;
    followers: number;
    engagement: number;
    impressions?: number;
    reach?: number;
  }>;
  topPosts: Array<{
    id: number;
    platform: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagementRate: number;
  }>;
  followerGrowth: Array<{
    date: string;
    followers: number;
  }>;
  platformDistribution: Record<string, number>;
  timeRange: {
    start: string;
    end: string;
  };
}

export class ReportService {
  static async generateReport(userId: number, reportType: string, dateRange: { start: string; end: string }): Promise<Report> {
    try {
      // Get user's social accounts
      const accounts = await storage.getSocialAccounts(userId);
      
      // Calculate overview metrics
      const overview = await this.calculateOverviewMetrics(accounts);
      
      // Get platform statistics
      const platformStats = await this.getPlatformStats(accounts);
      
      // Get top performing posts
      const topPosts = await this.getTopPosts(accounts);
      
      // Get follower growth data
      const followerGrowth = await this.getFollowerGrowthData(accounts, dateRange);
      
      // Get platform distribution
      const platformDistribution = await this.getPlatformDistribution(accounts);
      
      const reportData: ReportData = {
        overview,
        platformStats,
        topPosts,
        followerGrowth,
        platformDistribution,
        timeRange: dateRange,
      };
      
      // Generate report title
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analytics Report`;
      
      // Create report record
      const report = await storage.createReport({
        userId,
        reportType,
        title,
        data: reportData,
        dateRange,
      });
      
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
  
  private static async calculateOverviewMetrics(accounts: any[]): Promise<ReportData['overview']> {
    let totalFollowers = 0;
    let totalEngagement = 0;
    let totalImpressions = 0;
    let activePlatforms = 0;
    
    for (const account of accounts) {
      if (account.isActive) {
        activePlatforms++;
        
        // Get latest metrics for this account
        const metrics = await storage.getLatestMetrics(account.id);
        if (metrics) {
          totalFollowers += metrics.followers || 0;
          totalEngagement += metrics.engagementRate || 0;
          totalImpressions += metrics.impressions || 0;
        }
      }
    }
    
    return {
      totalFollowers,
      engagementRate: activePlatforms > 0 ? totalEngagement / activePlatforms : 0,
      totalImpressions,
      activePlatforms,
    };
  }
  
  private static async getPlatformStats(accounts: any[]): Promise<ReportData['platformStats']> {
    const stats = [];
    
    for (const account of accounts) {
      const metrics = await storage.getLatestMetrics(account.id);
      
      stats.push({
        platform: account.platform,
        username: account.username,
        followers: metrics?.followers || 0,
        engagement: metrics?.engagementRate || 0,
        impressions: metrics?.impressions || 0,
        reach: metrics?.reach || 0,
      });
    }
    
    return stats;
  }
  
  private static async getTopPosts(accounts: any[]): Promise<ReportData['topPosts']> {
    const allPosts = [];
    
    for (const account of accounts) {
      const posts = await storage.getTopPosts(account.id, 5);
      allPosts.push(...posts);
    }
    
    // Sort by engagement rate and return top 10
    return allPosts
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 10)
      .map(post => ({
        id: post.id,
        platform: post.platform,
        content: post.content,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        engagementRate: post.engagementRate,
      }));
  }
  
  private static async getFollowerGrowthData(accounts: any[], dateRange: { start: string; end: string }): Promise<ReportData['followerGrowth']> {
    const growthData: Record<string, number> = {};
    
    for (const account of accounts) {
      const metrics = await storage.getPlatformMetrics(account.id, 30); // Get last 30 days
      
      for (const metric of metrics) {
        const date = metric.createdAt.toISOString().split('T')[0];
        if (!growthData[date]) {
          growthData[date] = 0;
        }
        growthData[date] += metric.followers || 0;
      }
    }
    
    return Object.entries(growthData)
      .map(([date, followers]) => ({ date, followers }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  private static async getPlatformDistribution(accounts: any[]): Promise<Record<string, number>> {
    const distribution: Record<string, number> = {};
    
    for (const account of accounts) {
      const metrics = await storage.getLatestMetrics(account.id);
      const followers = metrics?.followers || 0;
      
      if (!distribution[account.platform]) {
        distribution[account.platform] = 0;
      }
      distribution[account.platform] += followers;
    }
    
    return distribution;
  }
  
  static async exportReportToCSV(report: Report): Promise<string> {
    const data = report.data as ReportData;
    
    let csv = 'Report: ' + report.title + '\n';
    csv += 'Generated: ' + report.createdAt.toISOString() + '\n';
    csv += 'Time Range: ' + data.timeRange.start + ' to ' + data.timeRange.end + '\n\n';
    
    // Overview section
    csv += 'OVERVIEW\n';
    csv += 'Total Followers,' + data.overview.totalFollowers + '\n';
    csv += 'Engagement Rate,' + data.overview.engagementRate.toFixed(2) + '%\n';
    csv += 'Total Impressions,' + data.overview.totalImpressions + '\n';
    csv += 'Active Platforms,' + data.overview.activePlatforms + '\n\n';
    
    // Platform stats
    csv += 'PLATFORM STATISTICS\n';
    csv += 'Platform,Username,Followers,Engagement Rate,Impressions,Reach\n';
    for (const stat of data.platformStats) {
      csv += `${stat.platform},${stat.username},${stat.followers},${stat.engagement.toFixed(2)}%,${stat.impressions || 0},${stat.reach || 0}\n`;
    }
    csv += '\n';
    
    // Top posts
    csv += 'TOP PERFORMING POSTS\n';
    csv += 'Platform,Content,Likes,Comments,Shares,Views,Engagement Rate\n';
    for (const post of data.topPosts) {
      const content = post.content.replace(/,/g, ';').replace(/\n/g, ' ').substring(0, 100);
      csv += `${post.platform},"${content}",${post.likes},${post.comments},${post.shares},${post.views},${post.engagementRate.toFixed(2)}%\n`;
    }
    
    return csv;
  }
  
  static async exportReportToJSON(report: Report): Promise<string> {
    return JSON.stringify(report, null, 2);
  }
  
  static async exportReportToPDF(report: Report): Promise<Buffer> {
    // In a real implementation, you would use a PDF library like puppeteer or jsPDF
    // For now, we'll return a simple text representation as a Buffer
    const data = report.data as ReportData;
    
    let content = `SOCIAL MEDIA ANALYTICS REPORT\n\n`;
    content += `Title: ${report.title}\n`;
    content += `Generated: ${report.createdAt.toISOString()}\n`;
    content += `Time Range: ${data.timeRange.start} to ${data.timeRange.end}\n\n`;
    
    content += `OVERVIEW\n`;
    content += `Total Followers: ${data.overview.totalFollowers}\n`;
    content += `Engagement Rate: ${data.overview.engagementRate.toFixed(2)}%\n`;
    content += `Total Impressions: ${data.overview.totalImpressions}\n`;
    content += `Active Platforms: ${data.overview.activePlatforms}\n\n`;
    
    content += `PLATFORM STATISTICS\n`;
    for (const stat of data.platformStats) {
      content += `${stat.platform} (${stat.username}): ${stat.followers} followers, ${stat.engagement.toFixed(2)}% engagement\n`;
    }
    content += '\n';
    
    content += `TOP PERFORMING POSTS\n`;
    data.topPosts.forEach((post, index) => {
      content += `${index + 1}. ${post.platform}: ${post.content.substring(0, 100)}...\n`;
      content += `   Likes: ${post.likes}, Comments: ${post.comments}, Shares: ${post.shares}\n`;
    });
    
    return Buffer.from(content);
  }
}
import { storage } from "../storage";

export interface SocialMediaMetrics {
  followers: number;
  following: number;
  engagementRate: number;
  impressions: number;
  reach: number;
}

export interface SocialMediaPost {
  id: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  timestamp: Date;
}

export abstract class SocialMediaPlatform {
  abstract platform: string;
  
  constructor(
    protected accessToken: string,
    protected refreshToken?: string
  ) {}
  
  abstract fetchMetrics(): Promise<SocialMediaMetrics>;
  abstract fetchPosts(limit?: number): Promise<SocialMediaPost[]>;
  abstract refreshAccessToken(): Promise<string>;
  abstract isTokenValid(): Promise<boolean>;
}

export class InstagramService extends SocialMediaPlatform {
  platform = "instagram";
  
  async fetchMetrics(): Promise<SocialMediaMetrics> {
    // Instagram Basic Display API implementation
    try {
      const response = await fetch(`https://graph.instagram.com/me?fields=account_type,media_count&access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get follower count (requires Instagram Business API)
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/insights?metric=follower_count,impressions,reach,profile_views&access_token=${this.accessToken}`
      );
      
      const insights = await insightsResponse.json();
      
      return {
        followers: insights.data?.find((d: any) => d.name === 'follower_count')?.values[0]?.value || 0,
        following: 0, // Not available in Basic Display API
        engagementRate: 0, // Calculated from posts
        impressions: insights.data?.find((d: any) => d.name === 'impressions')?.values[0]?.value || 0,
        reach: insights.data?.find((d: any) => d.name === 'reach')?.values[0]?.value || 0,
      };
    } catch (error) {
      console.error('Instagram metrics fetch error:', error);
      throw error;
    }
  }
  
  async fetchPosts(limit = 10): Promise<SocialMediaPost[]> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.data?.map((post: any) => ({
        id: post.id,
        content: post.caption || '',
        imageUrl: post.media_url,
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        shares: 0, // Not available in API
        views: 0, // Not available in Basic Display API
        timestamp: new Date(post.timestamp),
      })) || [];
    } catch (error) {
      console.error('Instagram posts fetch error:', error);
      throw error;
    }
  }
  
  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Instagram token refresh error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Instagram token refresh error:', error);
      throw error;
    }
  }
  
  async isTokenValid(): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.instagram.com/me?access_token=${this.accessToken}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class TwitterService extends SocialMediaPlatform {
  platform = "twitter";
  
  async fetchMetrics(): Promise<SocialMediaMetrics> {
    // Twitter API v2 implementation
    try {
      const response = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }
      
      const data = await response.json();
      const metrics = data.data?.public_metrics || {};
      
      return {
        followers: metrics.followers_count || 0,
        following: metrics.following_count || 0,
        engagementRate: 0, // Calculated from posts
        impressions: 0, // Requires additional API calls
        reach: 0, // Requires additional API calls
      };
    } catch (error) {
      console.error('Twitter metrics fetch error:', error);
      throw error;
    }
  }
  
  async fetchPosts(limit = 10): Promise<SocialMediaPost[]> {
    try {
      const response = await fetch(
        `https://api.twitter.com/2/users/me/tweets?max_results=${limit}&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.data?.map((tweet: any) => ({
        id: tweet.id,
        content: tweet.text || '',
        imageUrl: data.includes?.media?.find((m: any) => m.media_key === tweet.attachments?.media_keys?.[0])?.url,
        likes: tweet.public_metrics?.like_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
        shares: tweet.public_metrics?.retweet_count || 0,
        views: tweet.public_metrics?.impression_count || 0,
        timestamp: new Date(tweet.created_at),
      })) || [];
    } catch (error) {
      console.error('Twitter posts fetch error:', error);
      throw error;
    }
  }
  
  async refreshAccessToken(): Promise<string> {
    // Twitter uses bearer tokens that don't expire
    return this.accessToken;
  }
  
  async isTokenValid(): Promise<boolean> {
    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class TikTokService extends SocialMediaPlatform {
  platform = "tiktok";
  
  async fetchMetrics(): Promise<SocialMediaMetrics> {
    // TikTok for Developers API implementation
    try {
      const response = await fetch('https://open-api.tiktok.com/user/info/', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        followers: data.data?.follower_count || 0,
        following: data.data?.following_count || 0,
        engagementRate: 0, // Calculated from posts
        impressions: 0, // Not available in basic API
        reach: 0, // Not available in basic API
      };
    } catch (error) {
      console.error('TikTok metrics fetch error:', error);
      throw error;
    }
  }
  
  async fetchPosts(limit = 10): Promise<SocialMediaPost[]> {
    try {
      const response = await fetch(
        `https://open-api.tiktok.com/video/list/?max_count=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.data?.videos?.map((video: any) => ({
        id: video.id,
        content: video.title || '',
        imageUrl: video.cover_image_url,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        views: video.view_count || 0,
        timestamp: new Date(video.create_time * 1000),
      })) || [];
    } catch (error) {
      console.error('TikTok posts fetch error:', error);
      throw error;
    }
  }
  
  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://open-api.tiktok.com/oauth/refresh_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: this.refreshToken || '',
          grant_type: 'refresh_token',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`TikTok token refresh error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('TikTok token refresh error:', error);
      throw error;
    }
  }
  
  async isTokenValid(): Promise<boolean> {
    try {
      const response = await fetch('https://open-api.tiktok.com/user/info/', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class FacebookService extends SocialMediaPlatform {
  platform = "facebook";
  
  async fetchMetrics(): Promise<SocialMediaMetrics> {
    // Facebook Graph API implementation
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=followers_count,fan_count&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        followers: data.followers_count || data.fan_count || 0,
        following: 0, // Not available for pages
        engagementRate: 0, // Calculated from posts
        impressions: 0, // Requires insights API
        reach: 0, // Requires insights API
      };
    } catch (error) {
      console.error('Facebook metrics fetch error:', error);
      throw error;
    }
  }
  
  async fetchPosts(limit = 10): Promise<SocialMediaPost[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me/posts?fields=id,message,full_picture,created_time,likes.summary(true),comments.summary(true),shares&limit=${limit}&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.data?.map((post: any) => ({
        id: post.id,
        content: post.message || '',
        imageUrl: post.full_picture,
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
        views: 0, // Not available in basic API
        timestamp: new Date(post.created_time),
      })) || [];
    } catch (error) {
      console.error('Facebook posts fetch error:', error);
      throw error;
    }
  }
  
  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Facebook token refresh error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Facebook token refresh error:', error);
      throw error;
    }
  }
  
  async isTokenValid(): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/me?access_token=${this.accessToken}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class SocialMediaService {
  static createPlatformService(platform: string, accessToken: string, refreshToken?: string): SocialMediaPlatform {
    switch (platform) {
      case 'instagram':
        return new InstagramService(accessToken, refreshToken);
      case 'twitter':
        return new TwitterService(accessToken, refreshToken);
      case 'tiktok':
        return new TikTokService(accessToken, refreshToken);
      case 'facebook':
        return new FacebookService(accessToken, refreshToken);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  
  static async syncAccountData(accountId: number): Promise<void> {
    try {
      const accounts = await storage.getSocialAccounts(1); // Demo user
      const account = accounts.find(a => a.id === accountId);
      
      if (!account || !account.accessToken) {
        throw new Error('Account not found or missing access token');
      }
      
      const service = this.createPlatformService(account.platform, account.accessToken, account.refreshToken || undefined);
      
      // Check if token is valid
      const isValid = await service.isTokenValid();
      if (!isValid) {
        // Try to refresh token
        const newToken = await service.refreshAccessToken();
        await storage.updateSocialAccount(accountId, {
          accessToken: newToken,
          lastSync: new Date(),
        });
      }
      
      // Fetch metrics
      const metrics = await service.fetchMetrics();
      await storage.createPlatformMetrics({
        accountId,
        platform: account.platform,
        ...metrics,
      });
      
      // Fetch posts
      const posts = await service.fetchPosts(20);
      for (const post of posts) {
        await storage.createPost({
          accountId,
          platform: account.platform,
          postId: post.id,
          content: post.content,
          imageUrl: post.imageUrl,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          views: post.views,
          engagementRate: post.views > 0 ? ((post.likes + post.comments + post.shares) / post.views) * 100 : 0,
          postedAt: post.timestamp,
        });
      }
      
      // Update last sync time
      await storage.updateSocialAccount(accountId, {
        lastSync: new Date(),
      });
      
    } catch (error) {
      console.error(`Error syncing account ${accountId}:`, error);
      throw error;
    }
  }
  
  static async syncAllAccounts(userId: number): Promise<void> {
    try {
      const accounts = await storage.getSocialAccounts(userId);
      
      for (const account of accounts) {
        if (account.isActive) {
          await this.syncAccountData(account.id);
        }
      }
    } catch (error) {
      console.error(`Error syncing all accounts for user ${userId}:`, error);
      throw error;
    }
  }
}
export interface DashboardOverview {
  totalFollowers: number;
  engagementRate: number;
  totalImpressions: number;
  activePlatforms: number;
  platformStats: PlatformStat[];
}

export interface PlatformStat {
  platform: string;
  username: string;
  followers: number;
  engagement: number;
  impressions?: number;
  reach?: number;
}

export interface FollowerGrowthData {
  date: string;
  followers: number;
}

export interface Post {
  id: number;
  platform: string;
  platformName: string;
  username: string;
  content: string;
  imageUrl: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagementRate: number;
  postedAt: string;
}

export interface Report {
  id: number;
  userId: number;
  reportType: string;
  title: string;
  data: any;
  dateRange: {
    start: string;
    end: string;
  };
  createdAt: string;
}

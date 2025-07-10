import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PlatformStat {
  platform: string;
  username: string;
  followers: number;
  engagement: number;
  impressions?: number;
  reach?: number;
}

interface OverviewData {
  platformStats: PlatformStat[];
}

const platformIcons = {
  instagram: "📸",
  twitter: "🐦",
  tiktok: "🎵",
  facebook: "👥",
};

const platformColors = {
  instagram: "from-purple-500 to-pink-500",
  twitter: "from-blue-500 to-blue-600",
  tiktok: "from-black to-gray-800",
  facebook: "from-blue-600 to-blue-700",
};

export function PlatformStats() {
  const { data: overview, isLoading } = useQuery<OverviewData>({
    queryKey: ["/api/dashboard/overview"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!overview?.platformStats || overview.platformStats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <p className="text-slate-400">No platform data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {overview.platformStats.map((stat) => (
        <Card key={stat.platform} className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[stat.platform as keyof typeof platformColors]} rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-white text-lg">
                    {platformIcons[stat.platform as keyof typeof platformIcons]}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white capitalize">{stat.platform}</h4>
                  <p className="text-sm text-slate-400">{stat.username}</p>
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Followers</span>
                <span className="text-white font-medium">{stat.followers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Engagement</span>
                <span className="text-white font-medium">{stat.engagement.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {stat.platform === "twitter" ? "Impressions" : "Reach"}
                </span>
                <span className="text-white font-medium">
                  {stat.platform === "twitter" 
                    ? `${((stat.impressions || 0) / 1000).toFixed(0)}K`
                    : `${((stat.reach || 0) / 1000).toFixed(0)}K`
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

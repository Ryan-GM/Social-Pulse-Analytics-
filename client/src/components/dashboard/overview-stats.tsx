import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Eye, Link } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewData {
  totalFollowers: number;
  engagementRate: number;
  totalImpressions: number;
  activePlatforms: number;
}

export function OverviewStats() {
  const { data: overview, isLoading } = useQuery<OverviewData>({
    queryKey: ["/api/dashboard/overview"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <p className="text-slate-400">Failed to load overview data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Followers",
      value: overview.totalFollowers.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Engagement Rate",
      value: `${overview.engagementRate.toFixed(1)}%`,
      change: "+0.3%",
      icon: Heart,
      color: "text-pink-500",
    },
    {
      title: "Total Impressions",
      value: `${(overview.totalImpressions / 1000000).toFixed(1)}M`,
      change: "+18.2%",
      icon: Eye,
      color: "text-blue-500",
    },
    {
      title: "Active Platforms",
      value: overview.activePlatforms.toString(),
      change: "All Connected",
      icon: Link,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-slate-900 border-slate-800 hover:border-blue-800/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-green-400 flex items-center">
              <span className="mr-1">↗</span>
              {stat.change}
              {stat.title !== "Active Platforms" && (
                <span className="text-slate-500 ml-1">vs last month</span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

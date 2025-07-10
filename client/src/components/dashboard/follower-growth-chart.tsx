import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface FollowerGrowthData {
  date: string;
  followers: number;
}

interface FollowerGrowthChartProps {
  days: number;
}

export function FollowerGrowthChart({ days }: FollowerGrowthChartProps) {
  const { data: growthData, isLoading } = useQuery<FollowerGrowthData[]>({
    queryKey: ["/api/dashboard/follower-growth", { days }],
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Follower Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!growthData || growthData.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Follower Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">No growth data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-white">Follower Growth</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={days === 7 ? "default" : "outline"}
            size="sm"
            className="text-xs"
          >
            7D
          </Button>
          <Button
            variant={days === 30 ? "default" : "outline"}
            size="sm"
            className="text-xs"
          >
            30D
          </Button>
          <Button
            variant={days === 90 ? "default" : "outline"}
            size="sm"
            className="text-xs"
          >
            90D
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Followers"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="followers"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

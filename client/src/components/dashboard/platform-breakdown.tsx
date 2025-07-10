import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = {
  instagram: "#E1306C",
  twitter: "#1DA1F2",
  tiktok: "#000000",
  facebook: "#1877F2",
};

export function PlatformBreakdown() {
  const { data: distribution, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/dashboard/platform-distribution"],
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!distribution || Object.keys(distribution).length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">No distribution data available</p>
        </CardContent>
      </Card>
    );
  }

  const data = Object.entries(distribution).map(([platform, percentage]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    value: percentage,
    color: COLORS[platform as keyof typeof COLORS] || "#64748B",
  }));

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Platform Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Share"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: "#f1f5f9" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

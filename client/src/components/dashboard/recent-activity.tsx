import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    id: 1,
    message: "Instagram data sync completed",
    timestamp: "2 minutes ago",
    type: "sync",
    color: "bg-blue-500",
  },
  {
    id: 2,
    message: "New follower milestone reached",
    timestamp: "1 hour ago",
    type: "milestone",
    color: "bg-green-500",
  },
  {
    id: 3,
    message: "Weekly report generated",
    timestamp: "3 hours ago",
    type: "report",
    color: "bg-purple-500",
  },
  {
    id: 4,
    message: "TikTok engagement rate increased",
    timestamp: "5 hours ago",
    type: "engagement",
    color: "bg-pink-500",
  },
  {
    id: 5,
    message: "Twitter data refresh completed",
    timestamp: "1 day ago",
    type: "sync",
    color: "bg-blue-500",
  },
];

export function RecentActivity() {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className={`w-2 h-2 ${activity.color} rounded-full mt-2 mr-3`} />
              <div className="flex-1">
                <p className="text-white text-sm">{activity.message}</p>
                <p className="text-slate-400 text-xs">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Post {
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
  postedAt: string;
}

const platformIcons = {
  instagram: "📸",
  twitter: "🐦",
  tiktok: "🎵",
  facebook: "👥",
};

const platformColors = {
  instagram: "text-pink-500",
  twitter: "text-blue-500",
  tiktok: "text-gray-800",
  facebook: "text-blue-600",
};

export function TopPerformingPosts() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/dashboard/top-posts"],
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">No posts available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-white">Top Performing Posts</CardTitle>
        <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400/10">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Post</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Platform</th>
                <th className="text-right text-sm font-medium text-slate-400 pb-3">Engagement</th>
                <th className="text-right text-sm font-medium text-slate-400 pb-3">Reach</th>
                <th className="text-right text-sm font-medium text-slate-400 pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center">
                      <img
                        src={post.imageUrl}
                        alt="Post preview"
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <p className="text-white font-medium line-clamp-1">{post.content}</p>
                        <p className="text-slate-400 text-sm line-clamp-1">
                          {post.content.length > 30 ? `${post.content.substring(30)}...` : post.content}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">
                        {platformIcons[post.platform as keyof typeof platformIcons]}
                      </span>
                      <span className="text-slate-300 capitalize">{post.platform}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-white font-medium">
                      {(post.likes + post.comments + post.shares).toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-sm block">
                      +{(((post.likes + post.comments + post.shares) / post.views) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-white font-medium">
                      {post.views > 1000 ? `${(post.views / 1000).toFixed(1)}K` : post.views}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-slate-400">
                      {formatDistanceToNow(new Date(post.postedAt), { addSuffix: true })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

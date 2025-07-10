import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { FollowerGrowthChart } from "@/components/dashboard/follower-growth-chart";
import { PlatformBreakdown } from "@/components/dashboard/platform-breakdown";
import { PlatformStats } from "@/components/dashboard/platform-stats";
import { TopPerformingPosts } from "@/components/dashboard/top-performing-posts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ExportReports } from "@/components/dashboard/export-reports";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("7");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 border-r border-slate-800">
          <Sidebar />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header dateRange={dateRange} setDateRange={setDateRange} />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <OverviewStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FollowerGrowthChart days={parseInt(dateRange)} />
            <PlatformBreakdown />
          </div>
          
          <PlatformStats />
          
          <TopPerformingPosts />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />
            <ExportReports />
          </div>
        </main>
      </div>
    </div>
  );
}

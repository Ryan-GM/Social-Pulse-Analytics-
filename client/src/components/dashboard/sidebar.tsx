import { BarChart3, Home, FileText, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", icon: Home, href: "/", current: true },
  { name: "Analytics", icon: BarChart3, href: "/analytics", current: false },
  { name: "Reports", icon: FileText, href: "/reports", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
];

export function Sidebar() {
  return (
    <div className="bg-slate-900 h-full p-6">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">SocialMetrics</h1>
      </div>
      
      <nav className="space-y-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              item.current
                ? "text-blue-400 bg-blue-950/50 border border-blue-800/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </a>
        ))}
      </nav>
    </div>
  );
}

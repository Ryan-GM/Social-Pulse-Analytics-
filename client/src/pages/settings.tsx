import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/dashboard/sidebar";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Settings as SettingsIcon,
  Trash2,
  Plus,
  RefreshCw,
  Shield,
  Mail,
  Clock,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  reportFrequency: string;
  reportFormat: string;
  reportEmail: string;
  autoSyncInterval: number;
}

interface SocialAccount {
  id: number;
  platform: string;
  username: string;
  isActive: boolean;
  lastSync: string;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: () => <div className="w-4 h-4 bg-black rounded-sm text-white flex items-center justify-center text-xs">T</div>,
};

const platformColors = {
  instagram: "bg-pink-500",
  twitter: "bg-blue-500",
  facebook: "bg-blue-600",
  youtube: "bg-red-500",
  tiktok: "bg-black",
};

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("accounts");
  const [userSettings, setUserSettings] = useState<Partial<User>>({});

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/settings"],
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social-accounts"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      return apiRequest("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      return apiRequest(`/api/social-accounts/${accountId}/sync`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account synced successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      return apiRequest(`/api/social-accounts/${accountId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account disconnected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnectPlatform = (platform: string) => {
    window.location.href = `/api/oauth/${platform}`;
  };

  const handleSyncAccount = (accountId: number) => {
    syncAccountMutation.mutate(accountId);
  };

  const handleDisconnectAccount = (accountId: number) => {
    disconnectAccountMutation.mutate(accountId);
  };

  const handleUpdateSettings = () => {
    updateUserMutation.mutate(userSettings);
  };

  const availablePlatforms = [
    { id: "instagram", name: "Instagram", color: "bg-pink-500" },
    { id: "twitter", name: "Twitter", color: "bg-blue-500" },
    { id: "facebook", name: "Facebook", color: "bg-blue-600" },
    { id: "youtube", name: "YouTube", color: "bg-red-500" },
    { id: "tiktok", name: "TikTok", color: "bg-black" },
  ];

  const connectedPlatforms = accounts?.map(account => account.platform) || [];
  const unconnectedPlatforms = availablePlatforms.filter(
    platform => !connectedPlatforms.includes(platform.id)
  );

  if (userLoading || accountsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-slate-400 mt-4">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <SettingsIcon className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="sync">Sync</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Connected Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts && accounts.length > 0 ? (
                      accounts.map((account) => {
                        const Icon = platformIcons[account.platform as keyof typeof platformIcons];
                        const color = platformColors[account.platform as keyof typeof platformColors];
                        
                        return (
                          <div key={account.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{account.username}</p>
                                <p className="text-slate-400 text-sm capitalize">{account.platform}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={account.isActive ? "default" : "secondary"}>
                                {account.isActive ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {account.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSyncAccount(account.id)}
                                disabled={syncAccountMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Sync
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDisconnectAccount(account.id)}
                                disabled={disconnectAccountMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No accounts connected yet</p>
                      </div>
                    )}

                    {unconnectedPlatforms.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h3 className="text-white font-medium mb-4">Connect New Account</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unconnectedPlatforms.map((platform) => {
                              const Icon = platformIcons[platform.id as keyof typeof platformIcons];
                              
                              return (
                                <Button
                                  key={platform.id}
                                  variant="outline"
                                  className="flex items-center justify-between p-4 h-auto"
                                  onClick={() => handleConnectPlatform(platform.id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                                      <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-white">{platform.name}</span>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-slate-400" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Report Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportFrequency" className="text-white">Report Frequency</Label>
                      <Select
                        value={userSettings.reportFrequency || user?.reportFrequency || "weekly"}
                        onValueChange={(value) => setUserSettings({...userSettings, reportFrequency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reportFormat" className="text-white">Report Format</Label>
                      <Select
                        value={userSettings.reportFormat || user?.reportFormat || "pdf"}
                        onValueChange={(value) => setUserSettings({...userSettings, reportFormat: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reportEmail" className="text-white">Report Email</Label>
                    <Input
                      id="reportEmail"
                      type="email"
                      value={userSettings.reportEmail || user?.reportEmail || ""}
                      onChange={(e) => setUserSettings({...userSettings, reportEmail: e.target.value})}
                      placeholder="Enter email address"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <Button onClick={handleUpdateSettings} disabled={updateUserMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    Update Report Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sync" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Sync Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="autoSyncInterval" className="text-white">Auto-sync Interval (hours)</Label>
                    <Input
                      id="autoSyncInterval"
                      type="number"
                      min="1"
                      max="168"
                      value={userSettings.autoSyncInterval || user?.autoSyncInterval || 24}
                      onChange={(e) => setUserSettings({...userSettings, autoSyncInterval: parseInt(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-sm text-slate-400">How often to automatically sync account data (1-168 hours)</p>
                  </div>
                  
                  <Button onClick={handleUpdateSettings} disabled={updateUserMutation.isPending}>
                    <Clock className="h-4 w-4 mr-2" />
                    Update Sync Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Data Encryption</p>
                        <p className="text-slate-400 text-sm">All data is encrypted at rest and in transit</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Token Security</p>
                        <p className="text-slate-400 text-sm">OAuth tokens are securely stored and auto-refreshed</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Data Retention</p>
                        <p className="text-slate-400 text-sm">Data is retained for 90 days unless otherwise specified</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
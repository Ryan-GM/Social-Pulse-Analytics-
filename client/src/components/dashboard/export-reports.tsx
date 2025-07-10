import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function ExportReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReportMutation = useMutation({
    mutationFn: async (reportType: string) => {
      const response = await apiRequest("POST", "/api/reports/generate", {
        reportType,
        title: `${reportType} Analytics Report`,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Your analytics report has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    try {
      await generateReportMutation.mutateAsync(reportType);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    // In a real app, this would trigger CSV export
    toast({
      title: "Export Started",
      description: "Your CSV export is being prepared.",
    });
  };

  const handleScheduleReport = () => {
    // In a real app, this would open a scheduling modal
    toast({
      title: "Schedule Report",
      description: "Report scheduling feature coming soon.",
    });
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Export & Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={() => handleGenerateReport("pdf")}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate PDF Report"}
          </Button>
          
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="w-full border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV Data
          </Button>
          
          <Button
            onClick={handleScheduleReport}
            variant="outline"
            className="w-full border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Weekly Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

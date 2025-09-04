import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, BarChart3 } from "lucide-react";

export default function BatchResults({ results }) {
  const getRiskColor = (label) => {
    switch (label) {
      case "No Risk":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "Low Risk":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "High Risk":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['Text', 'Score', 'Label', 'Confidence', 'Explanation'],
      ...results.map(r => [
        r.raw_text.slice(0, 50) + '...',
        r.score,
        r.label,
        (r.confidence * 100).toFixed(0) + '%',
        r.explanation.slice(0, 100) + '...'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryStats = {
    total: results.length,
    noRisk: results.filter(r => r.label === "No Risk").length,
    lowRisk: results.filter(r => r.label === "Low Risk").length,
    highRisk: results.filter(r => r.label === "High Risk").length,
    avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-indigo-50/40">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-slate-900">Batch Analysis Results</span>
            </div>
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{summaryStats.total}</div>
              <div className="text-sm text-slate-600">Total Items</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-700">{summaryStats.noRisk}</div>
              <div className="text-sm text-emerald-600">No Risk</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-700">{summaryStats.lowRisk}</div>
              <div className="text-sm text-amber-600">Low Risk</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{summaryStats.highRisk}</div>
              <div className="text-sm text-red-600">High Risk</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.slice(0, 10).map((result, index) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="max-w-xs truncate font-medium">
                        {result.raw_text.slice(0, 80)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-semibold">{result.score}%</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRiskColor(result.label)} border font-semibold`}>
                        {result.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {(result.confidence * 100).toFixed(0)}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
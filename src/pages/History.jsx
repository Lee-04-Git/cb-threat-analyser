import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Analysis } from "@/entities/Analysis";
import { format } from "date-fns";
import { Search, Filter, Eye, Download, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadAnalyses();
  }, []);

  const filterAnalyses = useCallback(() => {
    let filtered = analyses;
    
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.raw_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== "all") {
      filtered = filtered.filter(analysis => analysis.label === filterType);
    }
    
    setFilteredAnalyses(filtered);
  }, [analyses, searchTerm, filterType]);

  useEffect(() => {
    filterAnalyses();
  }, [filterAnalyses]);

  const loadAnalyses = async () => {
    try {
      const data = await Analysis.list('-created_date', 50);
      setAnalyses(data);
    } catch (error) {
      console.error("Error loading analyses:", error);
    }
    setIsLoading(false);
  };

  const exportAllData = () => {
    const exportData = analyses.map(analysis => ({
      id: analysis.id,
      input_type: analysis.input_type,
      raw_text: analysis.raw_text,
      file_name: analysis.file_name,
      score: analysis.score,
      label: analysis.label,
      confidence: analysis.confidence,
      explanation: analysis.explanation,
      mitigations: analysis.mitigations,
      signals: analysis.signals,
      extracted_urls: analysis.extracted_urls,
      created_date: analysis.created_date
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat-analysis-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllHistory = async () => {
    setIsClearing(true);
    try {
      // Delete all analyses
      await Promise.all(analyses.map(analysis => Analysis.delete(analysis.id)));
      setAnalyses([]);
      setFilteredAnalyses([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
    setIsClearing(false);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analysis History</h1>
              <p className="text-slate-600 mt-1">Review and search past security analyses</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "No Risk", "Low Risk", "High Risk"].map((filter) => (
                <Button
                  key={filter}
                  variant={filterType === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter)}
                  className="capitalize"
                >
                  {filter === "all" ? "All" : filter}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50/80 to-violet-50/40">
              <CardTitle className="flex items-center justify-between">
                <span>Recent Analyses ({filteredAnalyses.length})</span>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportAllData}
                    disabled={analyses.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={analyses.length === 0 || isClearing}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear History
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All History</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All analysis history will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={clearAllHistory}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Clear All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredAnalyses.map((analysis, index) => (
                        <motion.tr
                          key={analysis.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-slate-50"
                        >
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium truncate">
                                {analysis.raw_text.slice(0, 60)}...
                              </div>
                              <div className="text-xs text-slate-500 mt-1 truncate">
                                {analysis.explanation.slice(0, 80)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {analysis.input_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono font-semibold">
                              {analysis.score}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getRiskColor(analysis.label)} border font-semibold`}>
                              {analysis.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600">
                              {format(new Date(analysis.created_date), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-slate-400">
                              {format(new Date(analysis.created_date), "h:mm a")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {filteredAnalyses.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">No analyses found</h3>
                  <p className="text-slate-600">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
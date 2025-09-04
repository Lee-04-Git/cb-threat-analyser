
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // New import
import { Analysis } from "@/entities/Analysis";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Shield, AlertTriangle, FileText, Activity, FileDown, Trash2 } from "lucide-react"; // Added FileDown, Trash2
import BatchResultCard from "../components/analytics/BatchResultCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const [analyses, setAnalyses] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchLoading, setIsBatchLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const batchIds = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const ids = params.get('batch_ids');
    return ids ? ids.split(',') : [];
  }, [location.search]);

  useEffect(() => {
    loadAnalyses();
    if (batchIds.length > 0) {
      loadBatchResults(batchIds);
    } else {
      setIsBatchLoading(false); // If no batch IDs, stop batch loading
    }
  }, [batchIds]);

  const loadBatchResults = async (ids) => {
    setIsBatchLoading(true);
    try {
      const results = await Promise.all(ids.map(id => Analysis.get(id)));
      setBatchResults(results);
    } catch (error) {
      console.error("Error loading batch results:", error);
    }
    setIsBatchLoading(false);
  };

  const loadAnalyses = async () => {
    setIsLoading(true);
    try {
      const data = await Analysis.list('-created_date', 100); // Fetch up to 100 analyses
      setAnalyses(data);
    } catch (error) {
      console.error("Error loading analyses:", error);
    }
    setIsLoading(false);
  };

  const handleExportData = () => {
    const dataToExport = {
      totalAnalyses: analyses.length,
      riskDistribution: riskDistribution,
      typeDistribution: typeDistribution,
      allAnalyses: analyses // Export all detailed analysis objects
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analysis_dashboard_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to clear all analysis data displayed on this dashboard? This action will only clear client-side data and batch IDs from the URL. It will not delete data from the database.")) {
      setAnalyses([]); // Clear client-side state
      setBatchResults([]); // Clear batch results
      setIsLoading(false);
      setIsBatchLoading(false);

      // Clear batch_ids from URL if present
      const currentParams = new URLSearchParams(location.search);
      if (currentParams.has('batch_ids')) {
        currentParams.delete('batch_ids');
        navigate(`?${currentParams.toString()}`); // Update URL without reloading the page
      }

      console.log("All analysis data and batch IDs cleared from client.");
      // In a real application, you might also have a backend API call here
      // to delete data from the server if that was the intended functionality.
      // E.g., await Analysis.deleteAll();
    }
  };

  const riskDistribution = [
    { name: 'No Risk', value: analyses.filter(a => a.label === 'No Risk').length, color: '#10b981' },
    { name: 'Low Risk', value: analyses.filter(a => a.label === 'Low Risk').length, color: '#f59e0b' },
    { name: 'High Risk', value: analyses.filter(a => a.label === 'High Risk').length, color: '#ef4444' }
  ];

  const typeDistribution = [
    { name: 'Manual', count: analyses.filter(a => a.input_type === 'manual').length },
    { name: 'File', count: analyses.filter(a => a.input_type === 'file').length },
    { name: 'URL', count: analyses.filter(a => a.input_type === 'url').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4"> {/* Changed to items-start for button alignment */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                <p className="text-slate-600 mt-1">Analysis patterns and threat intelligence</p>
              </div>
            </div>
            <div className="flex gap-3 mt-1"> {/* Added margin top to align with text */}
              <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 hover:border-indigo-600">
                <FileDown className="w-4 h-4" />
                Export Data
              </Button>
              <Button onClick={handleClearData} variant="outline" className="flex items-center gap-2 text-red-600 border-red-300 hover:text-red-700 hover:border-red-400">
                <Trash2 className="w-4 h-4" />
                Clear Data
              </Button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {batchIds.length > 0 && ( // New AnimatePresence block for batch results
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-7 h-7 text-indigo-500" /> {/* Kept original size/color */}
                Latest Batch Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isBatchLoading ? (
                  Array.from({ length: batchIds.length }).map((_, i) => (
                    <Card key={i} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm"> {/* Preserved Card styling */}
                        <CardContent className="p-4">
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                  ))
                ) : (
                  batchResults.map(result => (
                    <BatchResultCard key={result.id} analysis={result} />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"> {/* Changed mb-4 to mb-6 */}
          <TrendingUp className="w-6 h-6 text-indigo-500" /> {/* Changed icon and size as per outline */}
          Overall Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> {/* Changed md:grid-cols-2 to sm:grid-cols-2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-full"
          >
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardContent className="p-6 flex items-center justify-between h-full"> {/* Added flex justify-between h-full */}
                <div className="flex items-center gap-4 w-full"> {/* Added w-full */}
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-grow min-w-0"> {/* Added flex-grow min-w-0 */}
                    <div className="text-2xl font-bold text-slate-900">{analyses.length}</div>
                    <div className="text-sm text-slate-600 truncate">Total Analyses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-full"
          >
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardContent className="p-6 flex items-center justify-between h-full">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-2xl font-bold text-emerald-700">
                      {riskDistribution.find(r => r.name === 'No Risk')?.value || 0}
                    </div>
                    <div className="text-sm text-slate-600 truncate">Safe Content</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-full"
          >
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardContent className="p-6 flex items-center justify-between h-full">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-2xl font-bold text-red-700">
                      {riskDistribution.find(r => r.name === 'High Risk')?.value || 0}
                    </div>
                    <div className="text-sm text-slate-600 truncate">High Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-full"
          >
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardContent className="p-6 flex items-center justify-between h-full">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-2xl font-bold text-slate-900">
                      {analyses.length > 0 ? 
                        Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) : 0}%
                    </div>
                    <div className="text-sm text-slate-600 truncate">Avg. Risk Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Input Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
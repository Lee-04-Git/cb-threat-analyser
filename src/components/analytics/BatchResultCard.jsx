import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Link as LinkIcon, Edit3, Eye } from "lucide-react";
import ResultDisplay from "../analyzer/ResultDisplay";

const icons = {
  file: FileText,
  manual: Edit3,
  url: LinkIcon
};

const riskColors = {
  "No Risk": "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Low Risk": "text-amber-700 bg-amber-50 border-amber-200",
  "High Risk": "text-red-700 bg-red-50 border-red-200",
};

export default function BatchResultCard({ analysis }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const Icon = icons[analysis.input_type] || FileText;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-md font-semibold truncate">
                {analysis.file_name || "Manual Input"}
              </CardTitle>
            </div>
            <Badge className={`${riskColors[analysis.label]} border font-semibold text-xs`}>
              {analysis.label}
            </Badge>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <p className="text-xs text-slate-500 line-clamp-2 mt-2">
              {analysis.raw_text}
            </p>
            <div className="flex items-end justify-between mt-4">
              <div className="text-left">
                <div className="text-2xl font-bold text-slate-800">{analysis.score}%</div>
                <div className="text-xs font-medium text-slate-500">Risk Score</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsDetailsOpen(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Analysis Details</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
            <ResultDisplay analysis={analysis} isAnalyzing={false} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
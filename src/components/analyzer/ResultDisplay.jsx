
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  ShieldAlert, 
  ShieldX, 
  Download, 
  Copy,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart,
  Target,
  FileSearch,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

export default function ResultDisplay({ analysis, isAnalyzing }) {
  const [evidenceOpen, setEvidenceOpen] = React.useState(false);

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Analyzing Content</h3>
                <p className="text-sm text-slate-600">Processing through multiple security APIs...</p>
              </div>
              <Progress value={70} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!analysis) {
    return null; // Don't show anything if there's no analysis
  }

  const getRiskIcon = (label) => {
    switch (label) {
      case "No Risk":
        return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case "Low Risk":
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "High Risk":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Shield className="w-6 h-6 text-slate-400" />;
    }
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

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
  };

  const exportResult = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signals = analysis.signals || {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-blue-50/40">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRiskIcon(analysis.label)}
              <span className="font-bold text-slate-900">Analysis Result</span>
            </div>
            <Badge className={`${getRiskColor(analysis.label)} font-semibold border`}>
              {analysis.label}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Risk Score Gauge */}
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={
                    analysis.score <= 19 ? "text-emerald-500" :
                    analysis.score <= 59 ? "text-amber-500" : "text-red-500"
                  }
                  strokeDasharray={351.86}
                  initial={{ strokeDashoffset: 351.86 }}
                  animate={{ strokeDashoffset: 351.86 - (analysis.score / 100) * 351.86 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-2xl font-bold text-slate-900"
                  >
                    {analysis.score}%
                  </motion.div>
                  <div className="text-xs text-slate-500">Risk Score</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <span>Confidence:</span>
                <Badge variant="outline" className="font-mono">
                  {(analysis.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Explanation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Assessment Summary</h4>
            <p className="text-slate-700 leading-relaxed">{analysis.explanation}</p>
          </div>

          {/* Mitigation Recommendations */}
          {analysis.mitigations && analysis.mitigations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Recommended Actions</h4>
              <ul className="space-y-2">
                {analysis.mitigations.map((mitigation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{mitigation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Evidence Breakdown */}
          <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="font-semibold text-slate-900">Evidence Breakdown</span>
                {evidenceOpen ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid gap-3">
                {signals.safe_browsing && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-slate-800">URL Reputation</h5>
                      <p className="text-sm text-slate-600">
                        Google Safe Browsing Verdict: 
                        <Badge variant={signals.safe_browsing.verdict === 'safe' ? 'secondary' : 'destructive'} className="ml-2">
                          {signals.safe_browsing.verdict}
                        </Badge>
                      </p>
                      {signals.safe_browsing.verdict !== 'safe' && (
                        <p className="text-xs text-red-600 mt-1">{signals.safe_browsing.details}</p>
                      )}
                    </div>
                  </div>
                )}
                 {signals.virustotal && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <FileSearch className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-slate-800">Crowdsourced Analysis</h5>
                      <p className="text-sm text-slate-600">
                        VirusTotal Score: 
                        <Badge variant={signals.virustotal.positives > 0 ? 'destructive' : 'secondary'} className="ml-2">
                          {signals.virustotal.reputation}
                        </Badge>
                      </p>
                    </div>
                  </div>
                )}
                {signals.text_model && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <BarChart className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-slate-800">Text Model Analysis</h5>
                      <p className="text-sm text-slate-600">{signals.text_model.summary}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Spam: {(signals.text_model.spam_prob * 100).toFixed(0)}%</Badge>
                        <Badge variant="outline">Phishing: {(signals.text_model.phish_prob * 100).toFixed(0)}%</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={copyResult} variant="outline" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Result
            </Button>
            <Button onClick={exportResult} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

import { Analysis } from "@/entities/Analysis";
import { InvokeLLM } from "@/integrations/Core";
import { createPageUrl } from "@/utils";

import ManualInput from "../components/analyzer/input/ManualInput";
import UrlInput from "../components/analyzer/input/UrlInput";
import FileInput from "../components/analyzer/input/FileInput";
import StagedItemsList from "../components/analyzer/StagedItemsList";

// Simple ID generator to replace uuid
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function AnalyzerPage() {
  const [stagedItems, setStagedItems] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const addItem = (type, content, name) => {
    setStagedItems(prev => [...prev, { id: generateId(), type, content, name }]);
  };

  const removeItem = (id) => {
    setStagedItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleAnalyzeAll = async () => {
    if (stagedItems.length === 0) return;
    setIsAnalyzing(true);

    const analysisPromises = stagedItems.map(item => {
      const prompt = `
        Analyze the following content for spam, phishing, and misinformation.
        Content: "${item.content}"
        Simulate a comprehensive analysis by acting as an aggregator for multiple security APIs.
        Return a JSON object with the following schema. BE STRICT WITH THE SCHEMA.
        {
          "score": "number (0-100)", 
          "label": "'No Risk' | 'Low Risk' | 'High Risk'", 
          "confidence": "number (0-1)",
          "explanation": "string", 
          "mitigations": ["string"],
          "signals": {
            "safe_browsing": {"verdict": "'safe' | 'unsafe' | 'unknown'", "details": "string"},
            "virustotal": {"positives": "number", "total": "number", "reputation": "string"},
            "text_model": {"spam_prob": "number", "misinfo_prob": "number", "phish_prob": "number", "summary": "string"}
          },
          "extracted_urls": ["string"]
        }`;

      return InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: { 
            score: { type: "number" }, 
            label: { type: "string" }, 
            confidence: { type: "number" }, 
            explanation: { type: "string" }, 
            mitigations: { type: "array", items: { type: "string" } }, 
            signals: { type: "object" }, 
            extracted_urls: { type: "array", items: { type: "string" } } 
          }
        }
      }).then(result => ({ ...item, result }));
    });

    try {
      const completedItems = await Promise.all(analysisPromises);
      const creationPromises = completedItems.map(item => {
        return Analysis.create({
          input_type: item.type, 
          raw_text: item.content, 
          file_name: item.name,
          extracted_urls: item.result.extracted_urls || [], 
          score: item.result.score, 
          label: item.result.label,
          confidence: item.result.confidence, 
          signals: item.result.signals || {}, 
          explanation: item.result.explanation,
          mitigations: item.result.mitigations || []
        });
      });
      const createdAnalyses = await Promise.all(creationPromises);
      const newIds = createdAnalyses.map(analysis => analysis.id);

      setStagedItems([]);
      navigate(createPageUrl(`Analytics?batch_ids=${newIds.join(',')}`));
    } catch (error) {
      console.error("Batch analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Threat Analyzer</h1>
              <p className="text-slate-600 mt-1">Stage content for batch analysis</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <motion.div layout>
              <ManualInput onAddItem={(content) => addItem('manual', content, 'Manual Text')} />
            </motion.div>
            <motion.div layout>
              <UrlInput onAddItem={(content) => addItem('url', content, 'URL Input')} />
            </motion.div>
             <motion.div layout>
              <FileInput onAddItem={addItem} />
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle>Analysis Queue ({stagedItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <StagedItemsList items={stagedItems} onRemoveItem={removeItem} />
                <Button
                  onClick={handleAnalyzeAll}
                  disabled={stagedItems.length === 0 || isAnalyzing}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    `Analyze All (${stagedItems.length})`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

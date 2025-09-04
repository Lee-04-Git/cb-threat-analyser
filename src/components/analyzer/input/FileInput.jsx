import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

export default function FileInput({ onAddItem }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        onAddItem('file', e.target.result, file.name);
      };
      reader.readAsText(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <FileText className="w-5 h-5" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.csv"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
            <p className="text-slate-500 mb-4 text-sm">Drag & drop files or click to browse</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Browse Files
            </Button>
             <p className="text-xs text-slate-400 mt-4">
              Supported: TXT, CSV
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
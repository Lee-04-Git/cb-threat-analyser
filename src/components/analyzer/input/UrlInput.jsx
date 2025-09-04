import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon, Plus } from "lucide-react";

export default function UrlInput({ onAddItem }) {
  const [urls, setUrls] = useState("");

  const handleAdd = () => {
    if (urls.trim()) {
      onAddItem(urls);
      setUrls("");
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <LinkIcon className="w-5 h-5" />
          URL Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="https://example.com&#10;https://suspicious-site.com"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          className="min-h-24"
        />
        <div className="flex justify-end items-center mt-3">
          <Button onClick={handleAdd} size="sm" disabled={!urls.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add to Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
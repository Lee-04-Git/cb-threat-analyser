import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Plus } from "lucide-react";

export default function ManualInput({ onAddItem }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim()) {
      onAddItem(text);
      setText("");
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Edit3 className="w-5 h-5" />
          Manual Text Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter or paste text content..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-24"
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-slate-500">{text.length} characters</span>
          <Button onClick={handleAdd} size="sm" disabled={!text.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add to Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
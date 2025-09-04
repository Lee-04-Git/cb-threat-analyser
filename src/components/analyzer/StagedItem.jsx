import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Edit3, X } from "lucide-react";

export default function StagedItem({ item, onRemove }) {
  const getIcon = () => {
    switch (item.type) {
      case 'file':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'url':
        return <LinkIcon className="w-4 h-4 text-purple-600" />;
      case 'manual':
        return <Edit3 className="w-4 h-4 text-emerald-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
          <p className="text-xs text-slate-500 truncate">{item.content}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="w-6 h-6 flex-shrink-0" onClick={onRemove}>
        <X className="w-4 h-4 text-slate-500" />
      </Button>
    </div>
  );
}
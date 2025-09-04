import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import StagedItem from "./StagedItem";

export default function StagedItemsList({ items, onRemoveItem }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-slate-500">Add content to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 h-80 overflow-y-auto pr-2">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StagedItem item={item} onRemove={() => onRemoveItem(item.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
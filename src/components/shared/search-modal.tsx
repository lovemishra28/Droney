"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <Search className="h-5 w-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 500+ SKUs by motor KV, frame size, or part number..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-4 text-xs text-zinc-500">
          {debouncedQuery ? (
            <p>Searching catalog for "{debouncedQuery}"...</p>
          ) : (
            <p>
              Type to search components, ESCs, motors, or certified used drones.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

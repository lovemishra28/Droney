import * as React from "react";

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="h-full w-full max-w-md border-l border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

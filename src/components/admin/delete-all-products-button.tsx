"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { deleteAllProductsAction } from "@/server/actions/admin-products";

interface DeleteAllProductsButtonProps {
  totalProducts: number;
}

export function DeleteAllProductsButton({
  totalProducts,
}: DeleteAllProductsButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setConfirmInput("");
    setErrorMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
    setConfirmInput("");
    setErrorMessage(null);
  };

  const isConfirmed = confirmInput.trim().toUpperCase() === "DELETE";

  const handleDeleteAll = () => {
    if (!isConfirmed) return;
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await deleteAllProductsAction();
        if (res.success) {
          setIsOpen(false);
          router.refresh();
          // Force a full reload to ensure all cached table state and metrics refresh immediately
          window.location.reload();
        } else {
          setErrorMessage(res.message || "Failed to delete products.");
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Unexpected error during deletion."
        );
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={totalProducts === 0}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-400 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500 hover:text-rose-900 dark:hover:text-rose-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
        title={
          totalProducts === 0
            ? "No products to delete"
            : `Delete all ${totalProducts} products`
        }
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete All Products</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Permanent Action
              </span>
            </div>

            {/* Title & Warning */}
            <h3 className="mt-4 text-lg font-black text-zinc-900 dark:text-white">
              Delete All {totalProducts} Products?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              This action will permanently delete{" "}
              <strong className="text-zinc-900 dark:text-white font-mono">
                all {totalProducts} catalog products
              </strong>{" "}
              from the database. All associated hardware specifications, media
              galleries, showcase telemetry, and inventory records will be wiped.
              <span className="block mt-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                This action cannot be undone.
              </span>
            </p>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Safety Confirmation Input */}
            <div className="mt-5 space-y-2">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-400">
                Type <span className="text-rose-600 dark:text-rose-400 font-bold">DELETE</span> to
                confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                disabled={isPending}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 font-mono text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-rose-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={!isConfirmed || isPending}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Confirm Delete All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

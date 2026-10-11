"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <aside className="w-full space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 lg:w-64">
      <div>
        <h4 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
          Condition
        </h4>
        <div className="mt-2.5 space-y-2 text-sm text-zinc-400">
          <label className="flex cursor-pointer items-center gap-2 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={searchParams.get("secondHand") === "true"}
              onChange={(e) =>
                handleFilterChange("secondHand", e.target.checked ? "true" : "")
              }
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0"
            />
            <span>Pre-Owned Fleet Only</span>
          </label>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-5">
        <h4 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
          Motor KV Class
        </h4>
        <div className="mt-2.5 space-y-1.5 text-xs text-zinc-400">
          {[
            "1750KV - 1960KV (6S)",
            "2400KV - 2550KV (4S)",
            "2700KV+ (Sub-250g)",
          ].map((kv) => (
            <button
              key={kv}
              onClick={() => handleFilterChange("kv", kv)}
              className="block py-1 text-left hover:text-emerald-400"
            >
              {kv}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

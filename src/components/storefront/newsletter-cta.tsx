"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter } from "@/server/actions/newsletter";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await subscribeNewsletter(email);
      setStatus(res);
      if (res.success) setEmail("");
    } catch {
      setStatus({ success: false, message: "Subscription failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-14 sm:py-18 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-black p-8 sm:p-12 lg:p-14 text-white shadow-2xl border border-zinc-800">
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left Content */}
            <div className="space-y-2 max-w-xl">
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#c8f33b] uppercase">
                VIP FLEET
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Stay ahead of the horizon.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Get instant WhatsApp &amp; email drops when inspected pre-owned gear is listed.
              </p>
            </div>

            {/* Right Form */}
            <div className="w-full lg:w-auto">
              {status?.success ? (
                <div className="flex items-center gap-2.5 rounded-full bg-zinc-900 border border-emerald-500/40 px-5 py-3 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{status.message}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full sm:w-80 rounded-full border border-zinc-800 bg-zinc-900/90 px-5 py-3 text-xs text-white placeholder-zinc-500 focus:border-[#c8f33b] focus:outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full bg-[#c8f33b] hover:bg-[#b8e530] px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition active:scale-95 disabled:opacity-50 shadow-md shrink-0"
                  >
                    <span>{loading ? "Joining..." : "SUBSCRIBE"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
              {status?.message && !status.success && (
                <p className="mt-2 text-xs text-rose-400 font-medium">{status.message}</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

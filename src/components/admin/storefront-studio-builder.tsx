"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Image as ImageIcon,
  BookOpen,
  Headphones,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  MoveVertical,
} from "lucide-react";
import { StorefrontImageUploader } from "@/components/admin/storefront-image-uploader";
import {
  saveStorefrontConfigAction,
  resetStorefrontConfigAction,
} from "@/server/actions/storefront-config";
import type {
  HeroSlideItem,
  PreOwnedSlideItem,
  FlightJournalItem,
  ConsultationBannerConfig,
} from "@/types/storefront-config";

interface StorefrontStudioBuilderProps {
  initialHeroSlides: HeroSlideItem[];
  initialPreOwnedSlides: PreOwnedSlideItem[];
  initialJournalArticles: FlightJournalItem[];
  initialConsultationBanner: ConsultationBannerConfig;
}

type TabType = "skeletal" | "hero" | "preowned" | "journal" | "consultation";

export function StorefrontStudioBuilder({
  initialHeroSlides,
  initialPreOwnedSlides,
  initialJournalArticles,
  initialConsultationBanner,
}: StorefrontStudioBuilderProps) {
  const [activeTab, setActiveTab] = useState<TabType>("skeletal");
  const [isPending, startTransition] = useTransition();

  // State for all 4 dynamic storefront sections
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(initialHeroSlides);
  const [preOwnedSlides, setPreOwnedSlides] = useState<PreOwnedSlideItem[]>(initialPreOwnedSlides);
  const [journalArticles, setJournalArticles] = useState<FlightJournalItem[]>(initialJournalArticles);
  const [consultationBanner, setConsultationBanner] = useState<ConsultationBannerConfig>(initialConsultationBanner);

  // Status & Notification
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --------------------------------------------------------------------------
  // Save Handlers
  // --------------------------------------------------------------------------
  const handleSaveHeroSlides = () => {
    startTransition(async () => {
      const res = await saveStorefrontConfigAction("hero_slider", heroSlides);
      if (res.success) {
        showStatus("success", "Top Hero Slider changes published live!");
      } else {
        showStatus("error", res.message || "Failed to save Hero Slider.");
      }
    });
  };

  const handleSavePreOwnedSlides = () => {
    startTransition(async () => {
      const res = await saveStorefrontConfigAction("preowned_slider", preOwnedSlides);
      if (res.success) {
        showStatus("success", "Pre-Owned Showcase Slider changes published live!");
      } else {
        showStatus("error", res.message || "Failed to save Pre-Owned Slider.");
      }
    });
  };

  const handleSaveJournalArticles = () => {
    startTransition(async () => {
      const res = await saveStorefrontConfigAction("flight_journal", journalArticles);
      if (res.success) {
        showStatus("success", "Flight Journal Articles published live!");
      } else {
        showStatus("error", res.message || "Failed to save Flight Journal Articles.");
      }
    });
  };

  const handleSaveConsultationBanner = () => {
    startTransition(async () => {
      const res = await saveStorefrontConfigAction("consultation_banner", consultationBanner);
      if (res.success) {
        showStatus("success", "Pilot Consultation Banner published live!");
      } else {
        showStatus("error", res.message || "Failed to save Consultation Banner.");
      }
    });
  };

  const handleSaveAll = () => {
    startTransition(async () => {
      const results = await Promise.all([
        saveStorefrontConfigAction("hero_slider", heroSlides),
        saveStorefrontConfigAction("preowned_slider", preOwnedSlides),
        saveStorefrontConfigAction("flight_journal", journalArticles),
        saveStorefrontConfigAction("consultation_banner", consultationBanner),
      ]);

      const allSuccess = results.every((r) => r.success);
      if (allSuccess) {
        showStatus("success", "All storefront sections synchronized and live on homepage!");
      } else {
        showStatus("error", "One or more sections encountered an issue while saving.");
      }
    });
  };

  // --------------------------------------------------------------------------
  // Reset Handlers
  // --------------------------------------------------------------------------
  const handleResetSection = (key: string) => {
    if (!confirm(`Are you sure you want to reset '${key}' back to system factory defaults?`)) {
      return;
    }
    startTransition(async () => {
      const res = await resetStorefrontConfigAction(key);
      if (res.success) {
        window.location.reload();
      } else {
        showStatus("error", res.message || "Reset failed.");
      }
    });
  };

  // --------------------------------------------------------------------------
  // Hero Slider Reordering & Mutators
  // --------------------------------------------------------------------------
  const moveHeroSlide = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= heroSlides.length) return;
    const updated = [...heroSlides];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setHeroSlides(updated);
  };

  const removeHeroSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert("At least one slide must remain in the Hero Slider.");
      return;
    }
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  };

  const addHeroSlide = () => {
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      image: "/images/hero-slide-1.webp",
      alt: "Altitude Drone Hardware",
      title: "New Featured Drone",
      badge: "NEW RELEASE",
      href: "/catalog?category=drones",
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  // --------------------------------------------------------------------------
  // Pre-Owned Slider Mutators
  // --------------------------------------------------------------------------
  const addPreOwnedSlide = () => {
    const newSlide: PreOwnedSlideItem = {
      id: `preowned-${Date.now()}`,
      image: "/images/preowned-slide-1.jpg",
      alt: "Pre-Owned Drone Fleet",
      title: "Certified Aviation Pre-Owned",
    };
    setPreOwnedSlides([...preOwnedSlides, newSlide]);
  };

  const removePreOwnedSlide = (index: number) => {
    if (preOwnedSlides.length <= 1) {
      alert("At least one slide must remain in the Pre-Owned Slider.");
      return;
    }
    setPreOwnedSlides(preOwnedSlides.filter((_, i) => i !== index));
  };

  // --------------------------------------------------------------------------
  // Flight Journal Mutators
  // --------------------------------------------------------------------------
  const toggleArticleVisibility = (id: string) => {
    setJournalArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, enabled: !art.enabled } : art))
    );
  };

  const addJournalArticle = () => {
    const newArticle: FlightJournalItem = {
      id: `art-${Date.now()}`,
      slug: `drone-guide-${Date.now().toString().slice(-4)}`,
      tag: "FIELD INSPECTION",
      title: "New Aerial Insight Article",
      description: "Comprehensive technical notes and camera settings for professional drone operators in India.",
      image: "/images/journal-first-drone.jpg",
      enabled: true,
    };
    setJournalArticles([...journalArticles, newArticle]);
  };

  const removeJournalArticle = (id: string) => {
    setJournalArticles(journalArticles.filter((art) => art.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Synchronization Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black dark:bg-[#c8f33b]/10 text-[#c8f33b] border border-zinc-800">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
                  Storefront Studio
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Visual homepage layout architecture, sliders, and dynamic content CMS.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Live Site</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8f33b] hover:bg-[#b8e530] text-black font-extrabold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving All...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Publish All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border shadow-lg transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-800"
              : "bg-rose-950 text-rose-100 border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("skeletal")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "skeletal"
              ? "bg-black text-[#c8f33b] dark:bg-white dark:text-black shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Skeletal Page Canvas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "hero"
              ? "bg-black text-[#c8f33b] dark:bg-white dark:text-black shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Hero Slider ({heroSlides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preowned")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "preowned"
              ? "bg-black text-[#c8f33b] dark:bg-white dark:text-black shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Pre-Owned Slider ({preOwnedSlides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("journal")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "journal"
              ? "bg-black text-[#c8f33b] dark:bg-white dark:text-black shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Flight Journal Articles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("consultation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "consultation"
              ? "bg-black text-[#c8f33b] dark:bg-white dark:text-black shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <Headphones className="h-3.5 w-3.5" />
          <span>Pilot Consultation Banner</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SKELETAL PAGE CANVAS (As requested in prompt)                  */}
      {/* ==================================================================== */}
      {activeTab === "skeletal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Visual Skeletal Wireframe (Click any block to configure)
            </span>
            <span className="text-xs text-zinc-400">
              Arranged in physical page rendering order
            </span>
          </div>

          <div className="space-y-4 rounded-3xl bg-zinc-100 dark:bg-zinc-950 p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            {/* 1. Skeletal Block: Top Hero Slider */}
            <div
              onClick={() => setActiveTab("hero")}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 hover:border-[#c8f33b] transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-bold">
                    01
                  </span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    Main Hero Screen Slider
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#c8f33b]/20 text-zinc-900 dark:text-[#c8f33b] text-[10px] font-bold">
                    {heroSlides.length} Live Slides
                  </span>
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-[#c8f33b] transition inline-flex items-center gap-1">
                  Configure Slider &rarr;
                </span>
              </div>

              {/* Thumbnails Strip */}
              <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="relative aspect-[16/9] w-36 shrink-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950 group/thumb"
                  >
                    <Image
                      src={slide.image}
                      alt={slide.alt || "Hero slide"}
                      fill
                      className="object-cover"
                      unoptimized={slide.image.startsWith("http")}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                      <span className="text-[10px] font-bold text-white truncate">
                        {slide.title || `Slide ${idx + 1}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Skeletal Block: Trust & Quality Strip */}
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-200 dark:border-zinc-800/60 opacity-80 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">
                  02
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Trust & Assurance Strip
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                100% Genuine · Express Aviation Dispatch · Verified Warranty
              </span>
            </div>

            {/* 3. Skeletal Block: Dual Fleet Showcase (Bottom Slider) */}
            <div
              onClick={() => setActiveTab("preowned")}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 hover:border-[#c8f33b] transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-bold">
                    03
                  </span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    Dual Fleet Showcase (New Arrivals + Pre-Owned Slider)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                    {preOwnedSlides.length} Pre-Owned Slides
                  </span>
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-[#c8f33b] transition inline-flex items-center gap-1">
                  Configure Pre-Owned Slider &rarr;
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 p-3 text-xs text-zinc-400 flex items-center justify-center">
                  <span>New Arrivals Product Grid (Auto-populated from Catalog)</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {preOwnedSlides.map((slide, i) => (
                    <div
                      key={slide.id || i}
                      className="relative aspect-video w-28 shrink-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950"
                    >
                      <Image
                        src={slide.image}
                        alt="Pre-owned slide"
                        fill
                        className="object-cover"
                        unoptimized={slide.image.startsWith("http")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Skeletal Block: Pilot Consultation Banner */}
            <div
              onClick={() => setActiveTab("consultation")}
              className="group cursor-pointer rounded-2xl bg-[#0c1813] p-5 border border-emerald-950 hover:border-[#c8f33b] transition-all shadow-sm hover:shadow-md text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-900 text-xs font-mono font-bold text-[#c8f33b]">
                    04
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    Pilot Consultation Banner
                  </span>
                </div>
                <span className="text-xs font-bold text-[#c8f33b] inline-flex items-center gap-1">
                  Configure Banner &rarr;
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block font-medium">
                    {consultationBanner.eyebrow}
                  </span>
                  <span className="text-base font-black">
                    {consultationBanner.headlineFirst}{" "}
                    <span className="text-[#c8f33b]">{consultationBanner.headlineSecond}</span>
                  </span>
                </div>
                <span className="px-4 py-2 rounded-xl bg-[#c8f33b] text-black text-xs font-black">
                  {consultationBanner.buttonText}
                </span>
              </div>
            </div>

            {/* 5. Skeletal Block: Flight Journal Articles */}
            <div
              onClick={() => setActiveTab("journal")}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 hover:border-[#c8f33b] transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-bold">
                    05
                  </span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    Flight Journal Editorial Articles
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                    {journalArticles.filter((a) => a.enabled).length} Visible on Homepage
                  </span>
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-[#c8f33b] transition inline-flex items-center gap-1">
                  Manage Articles &rarr;
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {journalArticles.map((art) => (
                  <div
                    key={art.id}
                    className={`rounded-xl p-3 border text-xs flex flex-col justify-between ${
                      art.enabled
                        ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                        : "border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-100/40 dark:bg-zinc-900/30 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold text-zinc-400">
                        {art.tag}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          art.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-300 text-zinc-600"
                        }`}
                      >
                        {art.enabled ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                      {art.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: HERO SLIDER CONFIGURATION                                     */}
      {/* ==================================================================== */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Top Hero Screen Slider
              </h2>
              <p className="text-xs text-zinc-500">
                Upload images, reorder slides, and assign destination links for the main homepage carousel.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetSection("hero_slider")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={addHeroSlide}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Slide</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveHeroSlides}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#c8f33b] hover:bg-[#b8e530] text-black text-xs font-extrabold shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Slider</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
              >
                <div className="space-y-4">
                  {/* Slide Position & Actions */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      SLIDE {index + 1} OF {heroSlides.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveHeroSlide(index, "up")}
                        className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === heroSlides.length - 1}
                        onClick={() => moveHeroSlide(index, "down")}
                        className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHeroSlide(index)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                        title="Delete Slide"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Image Uploader */}
                  <StorefrontImageUploader
                    currentUrl={slide.image}
                    sectionName="hero"
                    label="Slide Banner Graphic"
                    aspectRatio="aspect-[16/9]"
                    onImageChange={(newUrl) => {
                      const updated = [...heroSlides];
                      updated[index] = { ...updated[index], image: newUrl };
                      setHeroSlides(updated);
                    }}
                  />

                  {/* Clean Single Destination Link Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                      <span>Click Redirect Link</span>
                      <span className="text-[10px] font-normal text-zinc-400">(Where customer goes on click)</span>
                    </label>
                    <input
                      type="text"
                      value={slide.href}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[index] = { ...updated[index], href: e.target.value };
                        setHeroSlides(updated);
                      }}
                      placeholder="/catalog?search=..."
                      className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                    <span className="text-[10px] text-zinc-400 block">
                      Default: /catalog?category=drones
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: PRE-OWNED BOTTOM SLIDER CONFIGURATION                         */}
      {/* ==================================================================== */}
      {activeTab === "preowned" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Pre-Owned Fleet 3-Image Slider
              </h2>
              <p className="text-xs text-zinc-500">
                Manage the images and sequence for the bottom Pre-Owned showcase card.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetSection("preowned_slider")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={addPreOwnedSlide}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Slide</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSavePreOwnedSlides}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#c8f33b] hover:bg-[#b8e530] text-black text-xs font-extrabold shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Pre-Owned Slider</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {preOwnedSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="rounded-2xl bg-white dark:bg-zinc-900 p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    SLIDE {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePreOwnedSlide(index)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Remove Slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <StorefrontImageUploader
                  currentUrl={slide.image}
                  sectionName="preowned"
                  label="Slide Photo"
                  aspectRatio="aspect-[4/3]"
                  onImageChange={(newUrl) => {
                    const updated = [...preOwnedSlides];
                    updated[index] = { ...updated[index], image: newUrl };
                    setPreOwnedSlides(updated);
                  }}
                />

                <div>
                  <label className="text-[11px] font-semibold text-zinc-500">
                    Slide Description / Alt Text
                  </label>
                  <input
                    type="text"
                    value={slide.title || ""}
                    onChange={(e) => {
                      const updated = [...preOwnedSlides];
                      updated[index] = { ...updated[index], title: e.target.value };
                      setPreOwnedSlides(updated);
                    }}
                    placeholder="e.g. Verified Pre-Owned DJI Mini"
                    className="w-full mt-1 text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: FLIGHT JOURNAL ARTICLES CONFIGURATION                         */}
      {/* ==================================================================== */}
      {activeTab === "journal" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Flight Journal & Homepage Articles
              </h2>
              <p className="text-xs text-zinc-500">
                Choose which articles appear on the home screen, update photos, tags, and headlines.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetSection("flight_journal")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={addJournalArticle}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Article</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveJournalArticles}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#c8f33b] hover:bg-[#b8e530] text-black text-xs font-extrabold shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Articles</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {journalArticles.map((art) => (
              <div
                key={art.id}
                className={`rounded-2xl p-5 border shadow-sm space-y-4 transition ${
                  art.enabled
                    ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    : "bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-300/40 dark:border-zinc-800/40 opacity-70"
                }`}
              >
                {/* Header with Visibility Toggle */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => toggleArticleVisibility(art.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      art.enabled
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {art.enabled ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Visible on Homepage</span>
                      </>
                    ) : (
                      <span>Hidden</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeJournalArticle(art.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Article Cover Image */}
                <StorefrontImageUploader
                  currentUrl={art.image}
                  sectionName="journal"
                  label="Featured Cover Photo"
                  aspectRatio="aspect-[16/10]"
                  onImageChange={(newUrl) => {
                    setJournalArticles((prev) =>
                      prev.map((a) => (a.id === art.id ? { ...a, image: newUrl } : a))
                    );
                  }}
                />

                {/* Article Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Tag Category
                    </label>
                    <input
                      type="text"
                      value={art.tag}
                      onChange={(e) => {
                        const val = e.target.value;
                        setJournalArticles((prev) =>
                          prev.map((a) => (a.id === art.id ? { ...a, tag: val } : a))
                        );
                      }}
                      placeholder="e.g. BUYER'S GUIDE"
                      className="w-full mt-1 text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none uppercase font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Headline Title
                    </label>
                    <input
                      type="text"
                      value={art.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setJournalArticles((prev) =>
                          prev.map((a) => (a.id === art.id ? { ...a, title: val } : a))
                        );
                      }}
                      placeholder="Article Title..."
                      className="w-full mt-1 text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                      <span>Article Destination Link</span>
                      <span className="text-[10px] font-normal text-zinc-400 font-mono">/journal/[slug]</span>
                    </label>
                    <div className="mt-1 flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 overflow-hidden px-3 py-1.5 focus-within:border-black dark:focus-within:border-white">
                      <span className="text-xs font-mono text-zinc-400 select-none mr-1">/journal/</span>
                      <input
                        type="text"
                        value={art.slug}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJournalArticles((prev) =>
                            prev.map((a) => (a.id === art.id ? { ...a, slug: val } : a))
                          );
                        }}
                        placeholder="first-drone-guide"
                        className="w-full text-xs bg-transparent outline-none font-mono text-zinc-900 dark:text-zinc-100 font-semibold"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Opens article page when customer clicks the card.
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                      <span>Summary Description</span>
                      <span className="text-[10px] font-normal text-zinc-400">(Homepage card teaser)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={art.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setJournalArticles((prev) =>
                          prev.map((a) => (a.id === art.id ? { ...a, description: val } : a))
                        );
                      }}
                      placeholder="Short 2-3 sentence overview shown under the headline on the homepage..."
                      className="w-full mt-1 text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none text-zinc-800 dark:text-zinc-200"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Displays directly below the headline on the homepage card.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: PILOT CONSULTATION BANNER CONFIGURATION                       */}
      {/* ==================================================================== */}
      {activeTab === "consultation" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Pilot Consultation Banner Strip
              </h2>
              <p className="text-xs text-zinc-500">
                Customize the high-impact consultation action banner on the homepage.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetSection("consultation_banner")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveConsultationBanner}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#c8f33b] hover:bg-[#b8e530] text-black text-xs font-extrabold shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Banner</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-2xl space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Eyebrow Subtitle (Grey Top Text)
              </label>
              <input
                type="text"
                value={consultationBanner.eyebrow}
                onChange={(e) =>
                  setConsultationBanner({ ...consultationBanner, eyebrow: e.target.value })
                }
                className="w-full mt-1 text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Headline Line 1 (White Text)
                </label>
                <input
                  type="text"
                  value={consultationBanner.headlineFirst}
                  onChange={(e) =>
                    setConsultationBanner({ ...consultationBanner, headlineFirst: e.target.value })
                  }
                  className="w-full mt-1 text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Headline Line 2 (Green Highlighted Text)
                </label>
                <input
                  type="text"
                  value={consultationBanner.headlineSecond}
                  onChange={(e) =>
                    setConsultationBanner({ ...consultationBanner, headlineSecond: e.target.value })
                  }
                  className="w-full mt-1 text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none text-[#c8f33b] font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Button Label
                </label>
                <input
                  type="text"
                  value={consultationBanner.buttonText}
                  onChange={(e) =>
                    setConsultationBanner({ ...consultationBanner, buttonText: e.target.value })
                  }
                  className="w-full mt-1 text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Button Destination Link
                </label>
                <input
                  type="text"
                  value={consultationBanner.buttonHref}
                  onChange={(e) =>
                    setConsultationBanner({ ...consultationBanner, buttonHref: e.target.value })
                  }
                  className="w-full mt-1 text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

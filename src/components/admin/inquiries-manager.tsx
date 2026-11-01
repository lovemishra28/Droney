"use client";

import React, { useState, useTransition } from "react";
import {
  Search,
  Headphones,
  Cpu,
  Phone,
  MessageSquare,
  Clock,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Save,
  X,
  AlertCircle,
  Filter,
  Check,
  Send,
} from "lucide-react";
import {
  updateInquiryStatusAction,
  deleteInquiryAction,
} from "@/server/actions/admin-inquiries";
import type { InquiryStatus } from "@/types/inquiries";
import type { AdminInquiryRecord } from "@/server/queries/admin";

interface InquiriesManagerProps {
  initialInquiries: AdminInquiryRecord[];
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  new: {
    label: "New Request",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600/40",
    dotClass: "bg-amber-500 animate-pulse",
  },
  contacted: {
    label: "Contacted",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-600/40",
    dotClass: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-600/40",
    dotClass: "bg-purple-500",
  },
  resolved: {
    label: "Resolved",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600/40",
    dotClass: "bg-emerald-500",
  },
  archived: {
    label: "Archived",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    dotClass: "bg-zinc-400",
  },
};

function formatCleanWhatsAppNumber(rawPhone: string | null): string {
  if (!rawPhone) return "";
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function getRelativeTimeString(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [inquiries, setInquiries] = useState<AdminInquiryRecord[]>(
    initialInquiries.filter((i) => i.type !== "trade_in")
  );
  const [activeTab, setActiveTab] = useState<"all" | "consultation" | "custom_build">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Deletion confirm dialog
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Status update handler
  const handleStatusChange = (inquiryId: string, newStatus: InquiryStatus) => {
    startTransition(async () => {
      const res = await updateInquiryStatusAction({ inquiryId, status: newStatus });
      if (res.success) {
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === inquiryId ? { ...item, status: newStatus } : item
          )
        );
        showFeedback("success", `Marked as ${newStatus.replace("_", " ")}`);
      } else {
        showFeedback("error", res.message || "Failed to update status");
      }
    });
  };

  // Note save handler
  const handleSaveNote = (inquiryId: string, currentStatus: string) => {
    startTransition(async () => {
      const res = await updateInquiryStatusAction({
        inquiryId,
        status: currentStatus as InquiryStatus,
        adminNotes: noteDraft,
      });
      if (res.success) {
        setInquiries((prev) =>
          prev.map((item) => {
            if (item.id === inquiryId) {
              const prevPayload = (item.payload as Record<string, unknown>) || {};
              return {
                ...item,
                payload: { ...prevPayload, adminNotes: noteDraft },
              };
            }
            return item;
          })
        );
        setEditingNoteId(null);
        showFeedback("success", "Admin note saved");
      } else {
        showFeedback("error", res.message || "Failed to save note");
      }
    });
  };

  // Delete handler
  const handleDelete = (inquiryId: string) => {
    startTransition(async () => {
      const res = await deleteInquiryAction({ inquiryId });
      if (res.success) {
        setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
        setDeletingId(null);
        showFeedback("success", "Inquiry removed");
      } else {
        showFeedback("error", res.message || "Failed to delete inquiry");
      }
    });
  };

  // Tab counts
  const countAll = inquiries.length;
  const countConsultations = inquiries.filter((i) => i.type === "consultation").length;
  const countCustomBuilds = inquiries.filter((i) => i.type === "custom_build").length;

  // Filtered inquiries
  const filtered = inquiries.filter((item) => {
    if (item.type === "trade_in") return false;
    if (activeTab !== "all" && item.type !== activeTab) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;

    if (searchQuery.trim().length > 0) {
      const term = searchQuery.toLowerCase();
      const name = (item.fullName || "").toLowerCase();
      const phone = (item.phone || "").toLowerCase();
      const payloadStr = JSON.stringify(item.payload || {}).toLowerCase();
      return name.includes(term) || phone.includes(term) || payloadStr.includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-medium text-xs sm:text-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${
            feedbackMsg.type === "success"
              ? "bg-[#c8f33b] text-black border border-black/10"
              : "bg-rose-600 text-white border border-rose-700"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header & KPI Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8f33b] text-black shadow-xs">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Pilot Consultations Flight Desk
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Direct outreach via WhatsApp & phone for certified tuning, PID setup, and custom UAV builds.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3.5 py-2 text-xs font-mono">
            <span className="text-zinc-500">Total:</span>
            <span className="font-bold text-zinc-900 dark:text-white">{countAll}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-lime-300 dark:border-[#c8f33b]/40 bg-lime-50 dark:bg-zinc-900/80 px-3.5 py-2 text-xs font-mono text-lime-900 dark:text-[#c8f33b]">
            <span className="h-2 w-2 rounded-full bg-[#c8f33b]" />
            <span>Pilot Consultations:</span>
            <span className="font-bold">{countConsultations}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-indigo-300 dark:border-indigo-600/40 bg-indigo-50 dark:bg-zinc-900/80 px-3.5 py-2 text-xs font-mono text-indigo-900 dark:text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Custom Builds:</span>
            <span className="font-bold">{countCustomBuilds}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition select-none cursor-pointer ${
              activeTab === "all"
                ? "bg-black text-[#c8f33b] shadow-xs dark:bg-[#c8f33b] dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
            }`}
          >
            <span>All Consultations</span>
            <span className="rounded-md bg-zinc-200/60 dark:bg-black/20 px-1.5 py-0.2 text-[10px] font-mono">
              {countAll}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("consultation")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition select-none cursor-pointer ${
              activeTab === "consultation"
                ? "bg-black text-[#c8f33b] shadow-xs dark:bg-[#c8f33b] dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>Pilot 1-on-1</span>
            <span className="rounded-md bg-zinc-200/60 dark:bg-black/20 px-1.5 py-0.2 text-[10px] font-mono">
              {countConsultations}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom_build")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition select-none cursor-pointer ${
              activeTab === "custom_build"
                ? "bg-black text-[#c8f33b] shadow-xs dark:bg-[#c8f33b] dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Custom UAV Builds</span>
            <span className="rounded-md bg-zinc-200/60 dark:bg-black/20 px-1.5 py-0.2 text-[10px] font-mono">
              {countCustomBuilds}
            </span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2.5">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 shadow-2xs focus:border-black focus:outline-none dark:focus:border-[#c8f33b] transition cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New / Uncontacted</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name, phone, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-2xs focus:border-black focus:outline-none dark:focus:border-[#c8f33b] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inquiries List Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
            <Headphones className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No inquiries match your current filter
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all" || activeTab !== "all"
              ? "Try resetting search keywords or selecting 'All Statuses'."
              : "Incoming pilot consultations and custom build requests submitted via storefront will appear here live."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const payload = (item.payload as Record<string, unknown>) || {};
            const isConsultation = item.type === "consultation";
            const isCustomBuild = item.type === "custom_build";
            const statusInfo =
              STATUS_CONFIG[(item.status as InquiryStatus) || "new"] || STATUS_CONFIG.new;

            const waNumber = formatCleanWhatsAppNumber(item.phone);

            // Construct personalized WhatsApp greeting
            let waMessage = "";
            if (isConsultation) {
              const topicTitle = (payload.topic as string) || "Drone tuning";
              const craft = (payload.droneModel as string) || "";
              waMessage = `Hello ${item.fullName || "Pilot"}, this is the Flight Operations desk from Altitude Aviation regarding your Pilot Consultation request (${topicTitle}${craft ? ` for ${craft}` : ""}). When is a convenient time to connect?`;
            } else {
              waMessage = `Hello ${item.fullName || "Customer"}, this is Altitude Aviation flight engineering regarding your custom build inquiry.`;
            }

            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
            const isEditingThisNote = editingNoteId === item.id;
            const currentAdminNotes = (payload.adminNotes as string) || "";

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 p-5 sm:p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Top Row: Type Badge, Status Dropdown, Time */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/60 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    {/* Inquiry Type Pill */}
                    {isConsultation && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-black text-[#c8f33b] dark:bg-[#c8f33b] dark:text-black px-2.5 py-1 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
                        <Headphones className="h-3.5 w-3.5" />
                        <span>Pilot Consultation</span>
                      </span>
                    )}

                    {isCustomBuild && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>Custom UAV Build</span>
                      </span>
                    )}

                    {/* Status Pill Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-bold font-mono ${statusInfo.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClass}`} />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Right side: Status Switcher & Date */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTimeString(item.createdAt)}</span>
                    </span>

                    {/* Quick Status Dropdown */}
                    <select
                      value={item.status}
                      disabled={isPending}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as InquiryStatus)
                      }
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-black dark:focus:border-[#c8f33b] cursor-pointer"
                    >
                      <option value="new">Mark: New</option>
                      <option value="contacted">Mark: Contacted</option>
                      <option value="in_progress">Mark: In Progress</option>
                      <option value="resolved">Mark: Resolved</option>
                      <option value="archived">Mark: Archived</option>
                    </select>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeletingId(item.id)}
                      title="Delete inquiry"
                      className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Main Content Grid: Customer Info & Payload Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Customer Identity & Direct Outreach (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                        {item.fullName || "Customer"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-bold">{item.phone || "No phone provided"}</span>
                      </div>
                      {item.email && (
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {item.email}
                        </div>
                      )}
                    </div>

                    {/* Direct Contact CTAs */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {waNumber && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            // If current status is 'new', optimistically transition to 'contacted'
                            if (item.status === "new") {
                              handleStatusChange(item.id, "contacted");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 shadow-xs transition active:scale-95"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>WhatsApp Pilot Outreach</span>
                          <ExternalLink className="h-3 w-3 opacity-80" />
                        </a>
                      )}

                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs px-3 py-2 shadow-xs transition"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Direct Call</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Technical Payload Details (7 cols) */}
                  <div className="lg:col-span-7 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/40 p-4 space-y-3">
                    {/* Consultation Payload */}
                    {isConsultation && (
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                              Technical Topic
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white capitalize">
                              {((payload.topic as string) || "General Pilot Tuning").replace(/-/g, " ")}
                            </span>
                          </div>

                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                              Flight Experience
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white capitalize">
                              {(payload.pilotLevel as string) || "Standard Pilot"}
                            </span>
                          </div>
                        </div>

                        {Boolean(payload.droneModel) && (
                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                              Airframe / Flight Controller
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white">
                              {String(payload.droneModel)}
                            </span>
                          </div>
                        )}

                        {Boolean(payload.notes) && (
                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                              Customer Notes / Questions
                            </span>
                            <p className="text-zinc-700 dark:text-zinc-300 mt-1 italic">
                              "{String(payload.notes)}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Custom Build Payload */}
                    {isCustomBuild && (
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[9px] text-zinc-400 block">FRAME</span>
                            <span className="font-bold">{payload.frameName as string}</span>
                          </div>
                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[9px] text-zinc-400 block">MOTORS</span>
                            <span className="font-bold">{payload.motorsName as string}</span>
                          </div>
                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[9px] text-zinc-400 block">STACK</span>
                            <span className="font-bold">{payload.stackName as string}</span>
                          </div>
                          <div className="rounded-lg bg-white dark:bg-zinc-900 p-2 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-[9px] text-zinc-400 block">VTX</span>
                            <span className="font-bold">{payload.vtxName as string}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Internal Admin Notes Strip */}
                    <div className="border-t border-zinc-200/60 dark:border-zinc-800 pt-2 text-xs">
                      {isEditingThisNote ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Add internal flight desk notes (e.g., WhatsApp contacted, scheduled bench test)..."
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-black dark:focus:border-[#c8f33b]"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-2.5 py-1 text-xs text-zinc-500 hover:text-black dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleSaveNote(item.id, item.status)}
                              className="inline-flex items-center gap-1 rounded-lg bg-black dark:bg-[#c8f33b] px-3 py-1 text-xs font-bold text-white dark:text-black hover:opacity-90 transition"
                            >
                              <Save className="h-3 w-3" />
                              <span>Save Note</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 flex-1">
                            <Edit3 className="h-3 w-3 shrink-0 text-zinc-400" />
                            {currentAdminNotes ? (
                              <span className="text-zinc-800 dark:text-zinc-200 italic">
                                "{currentAdminNotes}"
                              </span>
                            ) : (
                              <span className="italic text-zinc-400">
                                No internal notes recorded yet.
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setNoteDraft(currentAdminNotes);
                            }}
                            className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-[#c8f33b] transition underline"
                          >
                            {currentAdminNotes ? "Edit Note" : "+ Add Note"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Delete this inquiry?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                This action is logged in audit records and will permanently remove this customer inquiry ticket.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(deletingId)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition shadow-xs"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

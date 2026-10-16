import React from "react";
import { CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

interface SecondHandBadgeProps {
  grade: "A" | "B" | "C" | string;
  showLabel?: boolean;
  hours?: number | null;
}

export function SecondHandBadge({
  grade,
  showLabel = true,
  hours,
}: SecondHandBadgeProps) {
  const normalizedGrade = (grade === "B" || grade === "C" ? grade : "A") as
    "A" | "B" | "C";

  const gradeStyles = {
    A: {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: Sparkles,
      title: "Grade A",
      subtitle: "Mint condition (<5 flight hours, zero repairs)",
    },
    B: {
      badge: "border-amber-200 bg-amber-50 text-amber-800",
      icon: CheckCircle2,
      title: "Grade B",
      subtitle: "Light operational wear (certified electronics, <20 cycles)",
    },
    C: {
      badge: "border-orange-200 bg-orange-50 text-orange-800",
      icon: ShieldAlert,
      title: "Grade C",
      subtitle: "Refurbished / field-tested (flight-ready components)",
    },
  }[normalizedGrade];

  const IconComponent = gradeStyles.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-tight ${
        normalizedGrade === "A"
          ? "text-emerald-700"
          : normalizedGrade === "B"
          ? "text-amber-700"
          : "text-orange-700"
      }`}
      title={gradeStyles.subtitle}
    >
      <IconComponent className="h-3 w-3" />
      <span>{gradeStyles.title}</span>
      {showLabel && (
        <span className="hidden font-normal text-zinc-500 sm:inline">
          · Certified
        </span>
      )}
      {hours !== undefined && hours !== null && (
        <span className="text-zinc-500">· {hours}h</span>
      )}
    </div>
  );
}

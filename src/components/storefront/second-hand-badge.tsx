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
      badge: "border-emerald-500/30 bg-emerald-950/80 text-emerald-300",
      icon: Sparkles,
      title: "Grade A",
      subtitle: "Mint condition (<5 flight hours, zero repairs)",
    },
    B: {
      badge: "border-amber-500/30 bg-amber-950/80 text-amber-300",
      icon: CheckCircle2,
      title: "Grade B",
      subtitle: "Light operational wear (certified electronics, <20 cycles)",
    },
    C: {
      badge: "border-orange-500/30 bg-orange-950/80 text-orange-300",
      icon: ShieldAlert,
      title: "Grade C",
      subtitle: "Refurbished / field-tested (flight-ready components)",
    },
  }[normalizedGrade];

  const IconComponent = gradeStyles.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold backdrop-blur-md ${gradeStyles.badge}`}
      title={gradeStyles.subtitle}
    >
      <IconComponent className="h-3 w-3" />
      <span>{gradeStyles.title}</span>
      {showLabel && (
        <span className="hidden font-normal opacity-90 sm:inline">
          • Certified
        </span>
      )}
      {hours !== undefined && hours !== null && (
        <span className="opacity-75">• {hours}h</span>
      )}
    </div>
  );
}

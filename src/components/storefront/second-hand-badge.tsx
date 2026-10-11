import type { CosmeticGrade } from "@/types";

interface SecondHandBadgeProps {
  grade: CosmeticGrade;
  hours?: number | null;
}

export function SecondHandBadge({ grade, hours }: SecondHandBadgeProps) {
  const gradeStyles = {
    A: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    B: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    C: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  const gradeLabels = {
    A: "Grade A (Mint / Flight-Tested)",
    B: "Grade B (Light Wear)",
    C: "Grade C (Refurbished)",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${gradeStyles[grade] || gradeStyles.A}`}
    >
      <span>{gradeLabels[grade] || `Grade ${grade}`}</span>
      {hours !== undefined && hours !== null && (
        <span className="opacity-75">• {hours}h logged</span>
      )}
    </span>
  );
}

import React from "react";
import {
  Battery,
  Cpu,
  Gauge,
  Package,
  ShieldCheck,
  Weight,
  Zap,
} from "lucide-react";
import { SecondHandBadge } from "@/components/storefront/second-hand-badge";

interface HardwareSpecMatrixProps {
  specifications?: {
    frameSizeMm?: number | null;
    weightGrams?: number | null;
    inputVoltageLipo?: string | null;
    motorKv?: string | null;
    fcFirmware?: string | null;
    escProtocol?: string | null;
    flightTimeMinutes?: number | null;
    payloadCapacityGrams?: number | null;
  } | null;
  secondHandDetails?: {
    cosmeticGrade: "A" | "B" | "C";
    flightHours: number | null;
    crashHistory: boolean;
    batteryCycleCount: number | null;
    includedAccessories: string[] | null;
    inspectionNotes: string | null;
  } | null;
  isSecondHand: boolean;
}

export function HardwareSpecMatrix({
  specifications,
  secondHandDetails,
  isSecondHand,
}: HardwareSpecMatrixProps) {
  const specs = [
    {
      label: "Wheelbase / Frame Size",
      value: specifications?.frameSizeMm
        ? `${specifications.frameSizeMm} mm`
        : null,
      icon: Gauge,
    },
    {
      label: "Dry Weight",
      value: specifications?.weightGrams
        ? `${specifications.weightGrams} g`
        : null,
      icon: Weight,
    },
    {
      label: "Input Voltage Rating",
      value: specifications?.inputVoltageLipo,
      icon: Battery,
    },
    {
      label: "Motor Velocity Constant",
      value: specifications?.motorKv,
      icon: Zap,
    },
    {
      label: "Flight Controller Stack",
      value: specifications?.fcFirmware,
      icon: Cpu,
    },
    {
      label: "ESC Protocol",
      value: specifications?.escProtocol,
      icon: Zap,
    },
    {
      label: "Hover / Flight Endurance",
      value: specifications?.flightTimeMinutes
        ? `~${specifications.flightTimeMinutes} Minutes`
        : null,
      icon: Gauge,
    },
    {
      label: "Payload Capacity",
      value: specifications?.payloadCapacityGrams
        ? `${specifications.payloadCapacityGrams} g`
        : null,
      icon: Package,
    },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="flex flex-col gap-6">
      {/* Certified Pre-Owned Inspection Report (Conditional) */}
      {isSecondHand && secondHandDetails && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
                Bench Inspection & Telemetry Logs
              </h3>
            </div>
            <SecondHandBadge grade={secondHandDetails.cosmeticGrade} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-lg bg-zinc-900/80 p-2.5">
              <span className="text-zinc-400">Flight Telemetry:</span>
              <p className="mt-0.5 font-semibold text-zinc-100">
                {secondHandDetails.flightHours ?? 0} Logged Hours
              </p>
            </div>
            <div className="rounded-lg bg-zinc-900/80 p-2.5">
              <span className="text-zinc-400">Battery Health:</span>
              <p className="mt-0.5 font-semibold text-zinc-100">
                {secondHandDetails.batteryCycleCount ?? 0} Discharge Cycles
              </p>
            </div>
            <div className="col-span-2 rounded-lg bg-zinc-900/80 p-2.5 sm:col-span-1">
              <span className="text-zinc-400">Structural Integrity:</span>
              <p
                className={`mt-0.5 font-semibold ${
                  secondHandDetails.crashHistory
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {secondHandDetails.crashHistory
                  ? "Minor strike (Repaired arms)"
                  : "Zero incident history"}
              </p>
            </div>
          </div>

          {secondHandDetails.inspectionNotes && (
            <p className="mt-3 text-xs leading-relaxed text-zinc-300">
              <strong>Technician Note:</strong>{" "}
              {secondHandDetails.inspectionNotes}
            </p>
          )}

          {secondHandDetails.includedAccessories &&
            secondHandDetails.includedAccessories.length > 0 && (
              <div className="mt-3 border-t border-amber-500/20 pt-2.5">
                <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Included Spares & Hardware:
                </span>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {secondHandDetails.includedAccessories.map(
                    (accessory, index) => (
                      <li
                        key={index}
                        className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-200"
                      >
                        {accessory}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Engineering Spec Matrix Table */}
      {specs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
            <h3 className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Technical Specifications & Compatibility
            </h3>
          </div>
          <dl className="divide-y divide-zinc-800/80">
            {specs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 text-xs transition-colors hover:bg-zinc-900/30 sm:text-sm"
                >
                  <dt className="flex items-center gap-2 text-zinc-400">
                    <Icon className="h-4 w-4 text-zinc-500" />
                    <span>{item.label}</span>
                  </dt>
                  <dd className="font-mono font-medium text-zinc-200">
                    {item.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </div>
  );
}

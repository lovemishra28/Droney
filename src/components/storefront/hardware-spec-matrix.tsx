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
      label: "Motor KV Rating",
      value: specifications?.motorKv,
      icon: Zap,
    },
    {
      label: "Flight Controller Firmware",
      value: specifications?.fcFirmware,
      icon: Cpu,
    },
    {
      label: "ESC Transmission Protocol",
      value: specifications?.escProtocol,
      icon: Cpu,
    },
    {
      label: "Est. Hover / Flight Duration",
      value: specifications?.flightTimeMinutes
        ? `${specifications.flightTimeMinutes} Minutes`
        : null,
      icon: Gauge,
    },
    {
      label: "Max Payload Capacity",
      value: specifications?.payloadCapacityGrams
        ? `${specifications.payloadCapacityGrams} g`
        : null,
      icon: Package,
    },
  ].filter((s) => s.value !== null && s.value !== undefined);

  return (
    <div className="flex flex-col gap-5">
      {/* Certified Pre-Owned Inspection Report (Conditional) */}
      {isSecondHand && secondHandDetails && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h3 className="text-xs font-bold font-mono tracking-wider text-emerald-950 uppercase">
                Bench Inspection & Telemetry Logs
              </h3>
            </div>
            <SecondHandBadge grade={secondHandDetails.cosmeticGrade} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-200/60 bg-white p-3">
              <span className="text-[10px] uppercase font-mono text-zinc-500">Flight Telemetry</span>
              <p className="mt-0.5 font-bold text-zinc-900">
                {secondHandDetails.flightHours ?? 0} Logged Hours
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/60 bg-white p-3">
              <span className="text-[10px] uppercase font-mono text-zinc-500">Battery Health</span>
              <p className="mt-0.5 font-bold text-zinc-900">
                {secondHandDetails.batteryCycleCount ?? 0} Discharge Cycles
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-emerald-200/60 bg-white p-3 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono text-zinc-500">Structural Integrity</span>
              <p
                className={`mt-0.5 font-bold ${
                  secondHandDetails.crashHistory
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {secondHandDetails.crashHistory
                  ? "Minor strike (Repaired arms)"
                  : "Zero incident history"}
              </p>
            </div>
          </div>

          {secondHandDetails.inspectionNotes && (
            <p className="mt-3 text-xs leading-relaxed text-zinc-600 bg-white p-3 rounded-xl border border-emerald-200/60">
              <strong className="text-black">Technician Note:</strong>{" "}
              {secondHandDetails.inspectionNotes}
            </p>
          )}

          {secondHandDetails.includedAccessories &&
            secondHandDetails.includedAccessories.length > 0 && (
              <div className="mt-3 border-t border-emerald-200/80 pt-3">
                <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  Included Spares & Hardware:
                </span>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {secondHandDetails.includedAccessories.map(
                    (accessory, index) => (
                      <li
                        key={index}
                        className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-zinc-800"
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
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70">
          <div className="border-b border-zinc-200 bg-zinc-100/60 px-4 py-3">
            <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-600 uppercase">
              Technical Specifications & Compatibility
            </h3>
          </div>
          <dl className="divide-y divide-zinc-200">
            {specs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 text-xs transition-colors hover:bg-white sm:text-sm"
                >
                  <dt className="flex items-center gap-2.5 text-zinc-600">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    <span>{item.label}</span>
                  </dt>
                  <dd className="font-mono font-bold text-black">
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

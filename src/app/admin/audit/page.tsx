import React from "react";
import { desc } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { auditLogs, type AuditLog, type User } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdminSession();

  type AuditLogWithAdmin = AuditLog & {
    admin: Pick<User, "fullName" | "email"> | null;
  };
  let realLogs: AuditLogWithAdmin[] = [];
  try {
    realLogs = await db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit: 50,
      with: {
        admin: {
          columns: { fullName: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error("[Admin Audit Logs DB Error]:", error);
  }

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-500 dark:bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
              Compliance & Audit Trail
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl font-sans">
            Immutable Administrative Audit Log
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Append-only security log recording stock overrides, bulk catalog ingestions, and direct UPI payment authorizations.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 px-3.5 py-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 shadow-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Non-Repudiation Logging Active</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 uppercase">
              <tr>
                <th className="px-5 py-3.5">Timestamp (IST)</th>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Action Code</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5 text-right">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
              {realLogs.length > 0 ? (
                realLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="px-5 py-4 font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-zinc-900 dark:text-white block">
                        {log.admin?.fullName || "System Administrator"}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {log.admin?.email || "internal-ops"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-700 dark:text-zinc-300">
                      <span className="text-zinc-500">{log.entityName} / </span>
                      <span className="text-zinc-900 dark:text-white font-semibold">{log.entityId}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {log.payload ? JSON.stringify(log.payload) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-zinc-500 dark:text-zinc-400 font-mono">
                    No administrative audit logs captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

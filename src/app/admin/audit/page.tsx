export default function AdminAuditPage() {
  const auditLogs = [
    {
      id: "log-1",
      admin: "Admin (Rohit S.)",
      action: "PAYMENT_VERIFIED",
      entity: "orders (ORD-82914)",
      time: "10 mins ago",
    },
    {
      id: "log-2",
      admin: "Admin (Rohit S.)",
      action: "PRICE_OVERRIDE",
      entity: "products (IMP-APX-5-6S)",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Immutable Administrative Audit Trail
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Append-only compliance log capturing price edits, stock overrides, and
          UTR payment settlements.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Administrator</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono text-zinc-500">
                  {log.time}
                </td>
                <td className="px-4 py-3 text-zinc-200">{log.admin}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{log.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

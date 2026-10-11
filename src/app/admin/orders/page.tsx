import Link from "next/link";

export default function AdminOrdersPage() {
  const orders = [
    {
      id: "ord-1",
      ref: "ORD-82914",
      customer: "Rohit Sharma",
      amount: "₹28,999",
      status: "Payment Awaiting Verification",
      courier: "Pending",
    },
    {
      id: "ord-2",
      ref: "ORD-72019",
      customer: "Priya Nair",
      amount: "₹14,200",
      status: "Paid / Processing",
      courier: "Blue Dart",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Order Dispatch & Fulfillment
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Link Indian logistics providers (Blue Dart, Delhivery, DTDC) with Air
          Waybill (AWB) numbers.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase">
            <tr>
              <th className="px-4 py-3">Order Ref</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Courier</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono text-zinc-400">{o.ref}</td>
                <td className="px-4 py-3 text-zinc-100">{o.customer}</td>
                <td className="px-4 py-3 font-bold">{o.amount}</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3 text-zinc-400">{o.courier}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-emerald-400 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

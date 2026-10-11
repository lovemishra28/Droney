import Link from "next/link";
import { Plus } from "lucide-react";

export default function AdminProductsPage() {
  const products = [
    {
      id: "prod-1",
      sku: "IMP-APX-5-6S",
      name: 'ImpulseRC Apex 5" 6S Freestyle Drone',
      stock: 4,
      price: "₹28,999",
      status: "Active",
    },
    {
      id: "prod-2",
      sku: "TM-F60-PRO-V",
      name: "T-Motor F60 PRO V 1950KV Brushless Motor",
      stock: 28,
      price: "₹2,350",
      status: "Active",
    },
    {
      id: "prod-3",
      sku: "GEP-CL35-V2-USED",
      name: "GEPRC CineLog35 V2 HD O3 (Grade A Certified)",
      stock: 1,
      price: "₹34,999",
      status: "Active (Pre-Owned)",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Hardware Catalog (500+ SKUs)
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage commercial stock, technical specs, and R2/Bunny media links.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          <span>New SKU</span>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Listing Name</th>
              <th className="px-4 py-3">Stock Units</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono text-zinc-400">{p.sku}</td>
                <td className="px-4 py-3 font-semibold text-zinc-100">
                  {p.name}
                </td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 font-bold">{p.price}</td>
                <td className="px-4 py-3 text-emerald-400">{p.status}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-emerald-400 hover:underline"
                  >
                    Edit
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

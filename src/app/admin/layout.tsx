import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FileSpreadsheet,
  CreditCard,
  Truck,
  History,
  Plane,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "500+ SKU Catalog", href: "/admin/products", icon: Package },
    { label: "Bulk CSV Import", href: "/admin/import", icon: FileSpreadsheet },
    { label: "UTR Payments Queue", href: "/admin/payments", icon: CreditCard },
    { label: "Order Fulfillment", href: "/admin/orders", icon: Truck },
    { label: "Security Audit Log", href: "/admin/audit", icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col justify-between border-r border-zinc-800 bg-zinc-900/40 p-5">
        <div className="space-y-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold tracking-wider"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Plane className="h-4 w-4 rotate-45" />
            </div>
            <span className="text-sm tracking-widest uppercase">
              Admin Portal
            </span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-[11px] text-zinc-500">
          <p className="font-semibold text-zinc-400">Edge Guard Active</p>
          <p className="mt-0.5">Session timeout: 60m inactivity</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

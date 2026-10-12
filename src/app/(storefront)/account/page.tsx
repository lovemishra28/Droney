import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Package, UserRound } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { formatINR } from "@/lib/utils";
import { getUserOrders } from "@/server/queries/orders";
import { getCurrentSession } from "@/server/services/session";
import { logoutAndRedirectAction } from "@/server/actions/auth";

export default async function AccountPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  const [user, orders] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, session.sub),
      columns: {
        fullName: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    }),
    getUserOrders(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-emerald-800 uppercase font-mono">
              Altitude Pilot Profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black">
              Welcome, {user.fullName}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Manage your verified pilot account and review your Altitude hardware orders.
            </p>
          </div>

          <form action={logoutAndRedirectAction}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-800 transition hover:bg-zinc-100 shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>

        <section className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-[#c8f33b] shadow-xs">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-black">Profile details</h2>
                <p className="text-xs text-zinc-500 font-mono">Verified Flight Member</p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-zinc-500 font-mono uppercase">Full name</dt>
                <dd className="mt-1 font-bold text-black">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 font-mono uppercase">Phone</dt>
                <dd className="mt-1 font-mono text-zinc-800">{user.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 font-mono uppercase">Email</dt>
                <dd className="mt-1 break-all text-zinc-800">
                  {user.email || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 font-mono uppercase">Member since</dt>
                <dd className="mt-1 font-mono text-zinc-800">
                  {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-black">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-black">Order history</h2>
                  <p className="text-xs text-zinc-500 font-mono">
                    {orders.length} submitted {orders.length === 1 ? "order" : "orders"}
                  </p>
                </div>
              </div>
              <Link
                href="/catalog"
                className="text-xs font-bold text-black hover:underline"
              >
                Continue shopping →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
                <p className="text-sm font-bold text-black">No flight orders yet.</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Orders appear here immediately after initiating UPI payment verification.
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-zinc-200">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order/${order.orderReference}`}
                    className="flex items-center justify-between gap-4 py-4 transition hover:bg-zinc-50 rounded-xl px-2"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold text-black">
                        #{order.orderReference}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")} · Status: {order.orderStatus.toUpperCase()}
                      </p>
                    </div>
                    <span className="text-base font-black text-black font-mono">
                      {formatINR(order.totalAmountPaise)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

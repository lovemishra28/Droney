import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  LogOut,
  Package,
  UserRound,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { formatINR } from "@/lib/utils";
import { getUserOrders } from "@/server/queries/orders";
import { getCurrentSession } from "@/server/services/session";
import { logoutAndRedirectAction } from "@/server/actions/auth";

export default async function AccountPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

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

  if (!user) redirect("/login");

  const firstName = user.fullName?.split(" ")[0] ?? user.fullName ?? "Pilot";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen bg-[#f4f5f0] overflow-hidden">
      {/* ── Background drone + mountain photography, right-aligned ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Parchment gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f4f5f0] via-[#eef0eb] to-[#e8ebe3]" />

        {/* Mountain / landscape photo — sits in the top-right corner */}
        <div className="absolute -top-10 right-0 w-[55%] h-[480px] opacity-80">
          <Image
            src="/images/altitude-canyon-banner.jpg"
            alt="Altitude aerial landscape"
            fill
            sizes="55vw"
            className="object-cover object-center"
            priority
          />
          {/* Fade to left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f4f5f0] via-[#f4f5f0]/30 to-transparent" />
          {/* Fade to bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f4f5f0]" />
        </div>

        {/* Subtle pine tree silhouette overlay on the left edge */}
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-zinc-700 w-full h-full">
            <polygon points="100,10 130,80 110,80 140,140 80,140 110,80 90,80" />
            <rect x="93" y="140" width="14" height="30" />
          </svg>
        </div>
      </div>

      {/* ── Page Content ── */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* ── Page Header ── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#5b7c38] uppercase font-mono">
              ALTITUDE PILOT PROFILE
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
              Welcome back,{" "}
              <span className="text-[#7ab32a]">{firstName}</span>
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Manage your verified pilot account and review your Altitude
              hardware orders.
            </p>
          </div>

          {/* Sign out — pill button matching reference */}
          <form action={logoutAndRedirectAction} className="shrink-0 mt-1">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-white transition shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>

        {/* ── Two-column card grid ── */}
        <div className="grid gap-5 md:grid-cols-[1fr_1.6fr]">

          {/* ── LEFT: Profile Details Card ── */}
          <div className="rounded-2xl border border-white/80 bg-white/85 backdrop-blur-md shadow-sm p-6">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a1a1a] text-[#7ab32a] shadow-sm shrink-0">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900 text-sm">
                  Profile details
                </h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-[#7ab32a]" />
                  <span className="text-xs text-zinc-500">
                    Verified Flight Member
                  </span>
                </div>
              </div>
            </div>

            {/* Profile field list */}
            <div className="space-y-0 divide-y divide-zinc-100">
              {/* Full name */}
              <div className="flex items-start gap-3.5 py-3.5">
                <UserRound className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-medium leading-none mb-1">
                    Full name
                  </p>
                  <p className="text-sm font-semibold text-zinc-800">
                    {user.fullName}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5 py-3.5">
                <Phone className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-medium leading-none mb-1">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-zinc-800 font-mono">
                    {user.phone ?? "Not provided"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5 py-3.5">
                <Mail className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-medium leading-none mb-1">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-zinc-800 break-all">
                    {user.email ?? "Not provided"}
                  </p>
                </div>
              </div>

              {/* Member since */}
              <div className="flex items-start gap-3.5 py-3.5">
                <Calendar className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-medium leading-none mb-1">
                    Member since
                  </p>
                  <p className="text-sm font-semibold text-zinc-800">
                    {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order History Card ── */}
          <div className="rounded-2xl border border-white/80 bg-white/85 backdrop-blur-md shadow-sm p-6">
            {/* Card header */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f4eb] text-[#7ab32a] shadow-sm shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-zinc-900 text-sm">
                      Order history
                    </h2>
                    <span className="rounded-md bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                      {orders.length} {orders.length === 1 ? "order" : "orders"}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/catalog"
                className="text-xs font-bold text-[#7ab32a] hover:text-[#5b7c38] transition flex items-center gap-1 shrink-0"
              >
                Continue shopping
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Empty state */}
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4">
                {/* Drone delivery illustration */}
                <div className="mb-5 w-52 h-28 relative opacity-80">
                  <svg
                    viewBox="0 0 300 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    {/* Mountains background */}
                    <path d="M0 120 L60 60 L120 90 L180 40 L240 80 L300 50 L300 160 L0 160Z" fill="#d4ddc4" opacity="0.4"/>
                    {/* Pine trees */}
                    <polygon points="20,120 30,95 40,120" fill="#7ab32a" opacity="0.5"/>
                    <polygon points="50,120 63,90 76,120" fill="#7ab32a" opacity="0.5"/>
                    <polygon points="240,120 250,100 260,120" fill="#7ab32a" opacity="0.5"/>
                    <polygon points="265,115 278,88 291,115" fill="#7ab32a" opacity="0.5"/>
                    {/* Drone body */}
                    <rect x="128" y="48" width="44" height="20" rx="4" fill="#333" />
                    {/* Drone camera */}
                    <circle cx="150" cy="72" r="6" fill="#222" />
                    {/* Drone arms */}
                    <line x1="128" y1="54" x2="108" y2="48" stroke="#555" strokeWidth="3"/>
                    <line x1="172" y1="54" x2="192" y2="48" stroke="#555" strokeWidth="3"/>
                    {/* Drone propellers */}
                    <ellipse cx="108" cy="46" rx="14" ry="4" fill="#555" opacity="0.6"/>
                    <ellipse cx="192" cy="46" rx="14" ry="4" fill="#555" opacity="0.6"/>
                    {/* Package hanging from drone */}
                    <line x1="150" y1="78" x2="150" y2="95" stroke="#888" strokeWidth="1.5" strokeDasharray="3,2"/>
                    <rect x="135" y="95" width="30" height="22" rx="3" fill="#7ab32a"/>
                    <rect x="147" y="95" width="6" height="22" fill="#5b7c38" opacity="0.5"/>
                    <line x1="135" y1="106" x2="165" y2="106" stroke="#5b7c38" strokeWidth="1" opacity="0.5"/>
                    {/* Ground / flat land */}
                    <line x1="0" y1="125" x2="300" y2="125" stroke="#c8d4b0" strokeWidth="1.5"/>
                  </svg>
                </div>

                <h3 className="text-base font-bold text-zinc-800">
                  Your next flight starts here
                </h3>
                <p className="mt-1.5 text-xs text-zinc-500 max-w-xs leading-relaxed">
                  Orders appear here immediately after initiating UPI payment
                  verification.
                </p>

                <Link
                  href="/catalog"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7ab32a] hover:bg-[#6aa020] text-white px-8 py-3 text-sm font-bold transition shadow-sm active:scale-[0.98]"
                >
                  Explore drones
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              /* Order list */
              <div className="divide-y divide-zinc-100">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order/${order.orderReference}`}
                    className="flex items-center justify-between gap-4 py-4 hover:bg-zinc-50/80 rounded-xl px-2 -mx-2 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f4eb] text-[#7ab32a] shrink-0">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold text-zinc-900">
                          #{order.orderReference}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}{" "}
                          ·{" "}
                          <span
                            className={`font-semibold ${
                              order.orderStatus === "delivered"
                                ? "text-[#7ab32a]"
                                : order.orderStatus === "cancelled"
                                  ? "text-red-500"
                                  : "text-amber-600"
                            }`}
                          >
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-zinc-900">
                        {formatINR(order.totalAmountPaise)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

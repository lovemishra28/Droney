import React from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { MobileNav } from "@/components/shared/mobile-nav";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { getProducts } from "@/server/queries/catalog";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let navProducts: any[] = [];
  try {
    const res = await getProducts({ pageSize: 50, sortBy: "newest" });
    navProducts = res.data || [];
  } catch (error) {
    console.warn("[Nav Products Fetch Warning]:", error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 selection:bg-[#c8f33b] selection:text-black">
      <Header initialNavProducts={navProducts} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <CartSheet />
      <MobileNav />
      <Footer />
    </div>
  );
}

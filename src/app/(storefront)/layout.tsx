import React from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { MobileNav } from "@/components/shared/mobile-nav";
import { CartSheet } from "@/components/storefront/cart-sheet";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <CartSheet />
      <MobileNav />
      <Footer />
    </div>
  );
}

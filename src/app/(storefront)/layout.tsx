import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { JOURNAL_POSTS } from "../page";

interface JournalDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { slug } = await params;
  const post = JOURNAL_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="bg-white min-h-screen text-zinc-900 py-12">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Flight Journal</span>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider text-white">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <Calendar className="h-3.5 w-3.5" />
              {post.date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed font-medium">
            {post.summary}
          </p>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-md">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-zinc max-w-none pt-6 text-zinc-700 leading-relaxed">
          <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed space-y-4">
            {post.content}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-zinc-200 pt-8 flex items-center justify-between">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-[#c8f33b] hover:bg-[#b8e530] px-6 py-3 text-xs font-black text-black transition"
          >
            <span>Explore Certified Gear</span>
          </Link>

          <Link
            href="/consult-pilot"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Have questions? Consult our flight desk →
          </Link>
        </div>
      </div>
    </article>
  );
}

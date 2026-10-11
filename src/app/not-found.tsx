import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-zinc-100">
      <div className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        404 Lost in Flight
      </div>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
        Altitude Signal Lost
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        The component or coordinates you are looking for do not exist or have
        been relocated.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
      >
        Return to Hangar (Storefront)
      </Link>
    </div>
  );
}

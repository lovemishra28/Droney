import Link from "next/link";
import { Plane, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold tracking-wider text-zinc-100 uppercase">
              <Plane className="h-5 w-5 rotate-45 text-emerald-400" />
              <span>AeroStore India</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">
              India's premier high-performance FPV and technical drone
              marketplace. 500+ genuine SKUs, flight-tested pre-owned equipment,
              zero-commission direct UPI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Hardware
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/catalog" className="hover:text-zinc-100">
                  FPV Frames
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-zinc-100">
                  Brushless Motors
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-zinc-100">
                  Flight Controllers & ESCs
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-zinc-100">
                  LiPo Batteries & Props
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Pre-Owned Fleet
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/used-drones" className="hover:text-zinc-100">
                  Grade A (Mint Flight-Tested)
                </Link>
              </li>
              <li>
                <Link href="/used-drones" className="hover:text-zinc-100">
                  Grade B (Operational Wear)
                </Link>
              </li>
              <li>
                <Link href="/used-drones" className="hover:text-zinc-100">
                  Grade C (Refurbished)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Operations
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/admin"
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-zinc-600">
                  Dispatched via Blue Dart / Delhivery
                </span>
              </li>
              <li>
                <span className="text-zinc-600">
                  GST Invoice with Input Credit
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-zinc-900 pt-6 text-xs text-zinc-600 sm:flex-row">
          <p>© 2026 AeroStore India. All rights reserved.</p>
          <div className="mt-2 flex gap-4 sm:mt-0">
            <span>Direct NPCI UPI Verified</span>
            <span>Zero Egress R2 Cloud Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { MediaGallery } from "@/components/storefront/media-gallery";
import { formatINR } from "@/lib/utils";
import { SecondHandBadge } from "@/components/storefront/second-hand-badge";
import { Check, ShieldCheck, Zap, Truck } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Mock product detail for blueprint validation
  const product = {
    id: "prod-1",
    slug,
    name: 'ImpulseRC Apex 5" 6S Freestyle Drone (BNF / ELRS 2.4GHz)',
    sku: "IMP-APX-5-6S",
    basePricePaise: 2899900,
    stockQuantity: 4,
    isSecondHand: true,
    cosmeticGrade: "A" as const,
    flightHours: 3,
    description:
      "Flight-tested 5-inch carbon frame built with high-torque 1950KV brushless motors, 55A BLS ESC stack, and expressLRS diversity telemetry receiver. Pre-tuned Betaflight 4.5 flight controller PID profiles.",
    specs: {
      frameSizeMm: 225,
      weightGrams: 395,
      inputVoltageLipo: "6S LiPo (22.2V)",
      motorKv: "1950KV",
      fcFirmware: "Betaflight 4.5.1",
      escProtocol: "DShot600",
      flightTimeMinutes: 7,
      payloadCapacityGrams: 450,
    },
    media: [
      {
        id: "m-1",
        productId: "prod-1",
        mediaType: "image" as const,
        storageProvider: "r2" as const,
        url: "https://cdn.yourdronestore.in/products/apex5.webp",
        displayOrder: 0,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        playbackId: null,
      },
      {
        id: "m-2",
        productId: "prod-1",
        mediaType: "video" as const,
        storageProvider: "bunny" as const,
        url: "https://video.yourdronestore.in/vid-1/playlist.m3u8",
        displayOrder: 1,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        playbackId: "vid-1",
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Media Column */}
        <div>
          <MediaGallery media={product.media} />
        </div>

        {/* Info & Buying Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500">
                {product.sku}
              </span>
              {product.isSecondHand && (
                <SecondHandBadge
                  grade={product.cosmeticGrade}
                  hours={product.flightHours}
                />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              {product.name}
            </h1>
          </div>

          <div className="border-y border-zinc-800/80 py-4">
            <span className="text-xs text-zinc-500">
              M.R.P. (Inclusive of all GST)
            </span>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-extrabold text-zinc-100">
                {formatINR(product.basePricePaise)}
              </p>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                In Stock ({product.stockQuantity} remaining)
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-zinc-400">
            {product.description}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="flex-1 rounded-xl bg-emerald-500 py-3.5 text-center text-sm font-bold text-zinc-950 transition hover:bg-emerald-400">
              Add to Flight Cart
            </button>
            <button className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-3.5 text-center text-sm font-bold text-zinc-200 transition hover:border-zinc-700">
              Direct UPI Fast Buy
            </button>
          </div>

          {/* Hardware Specs Matrix */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
              Hardware Engineering Matrix
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-zinc-500">Wheelbase</dt>
                <dd className="font-semibold text-zinc-200">
                  {product.specs.frameSizeMm}mm
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Dry Weight</dt>
                <dd className="font-semibold text-zinc-200">
                  {product.specs.weightGrams}g
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">LiPo Rating</dt>
                <dd className="font-semibold text-zinc-200">
                  {product.specs.inputVoltageLipo}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Motor KV</dt>
                <dd className="font-semibold text-zinc-200">
                  {product.specs.motorKv}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Flight Stack</dt>
                <dd className="font-semibold text-zinc-200">
                  {product.specs.fcFirmware}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Motor Protocol</dt>
                <dd className="font-semibold text-zinc-200">
                  {product.specs.escProtocol}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

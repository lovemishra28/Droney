import { ImageUploader } from "@/components/admin/image-uploader";
import { VideoUploader } from "@/components/admin/video-uploader";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Create New Catalog SKU
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Add hardware technical parameters, upload Cloudflare R2 images, and
          link Bunny.net flight videos.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
            Core Listing Attributes
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                SKU Code
              </label>
              <input
                type="text"
                placeholder="TM-F60-PRO-V"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Listing Title
              </label>
              <input
                type="text"
                placeholder="T-Motor F60 PRO V 1950KV"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Base Price (INR)
              </label>
              <input
                type="number"
                placeholder="2350"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Stock Quantity
              </label>
              <input
                type="number"
                placeholder="20"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ImageUploader />
          <VideoUploader />
        </div>

        <button
          type="button"
          className="rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
        >
          Save & Publish to Catalog
        </button>
      </form>
    </div>
  );
}

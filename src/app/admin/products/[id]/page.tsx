export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Edit Product Inventory ({id})
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Update pricing, adjust active inventory, and modify flight telemetry
          specs.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-xs text-zinc-400">
        Product editor form loaded for entity ID:{" "}
        <code className="text-zinc-200">{id}</code>.
      </div>
    </div>
  );
}

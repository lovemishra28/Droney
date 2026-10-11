export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Order Invoice & Dispatch Fulfillment
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Manage fulfillment status and print GST tax invoice packing slip.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
          Order ID: {id}
        </h3>
        <p className="text-xs text-zinc-400">
          Fulfillment state machine: PAID → PROCESSING → SHIPPED → DELIVERED.
        </p>
      </div>
    </div>
  );
}

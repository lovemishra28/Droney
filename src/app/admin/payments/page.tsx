import { UtrApprovalCard } from "@/components/admin/utr-approval-card";

export default function AdminPaymentsPage() {
  const pendingUtrs = [
    {
      orderId: "ord-1",
      orderReference: "ORD-82914",
      amountPaise: 2899900,
      utrNumber: "409823145672",
      screenshotUrl: null,
      adminId: "admin-master",
    },
    {
      orderId: "ord-2",
      orderReference: "ORD-93011",
      amountPaise: 470000,
      utrNumber: "409877651239",
      screenshotUrl: null,
      adminId: "admin-master",
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Direct UPI Verification Queue
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Match submitted 12-digit bank UTR numbers against incoming merchant
          account statements.
        </p>
      </div>

      <div className="space-y-4">
        {pendingUtrs.map((utr) => (
          <UtrApprovalCard key={utr.orderId} {...utr} />
        ))}
      </div>
    </div>
  );
}

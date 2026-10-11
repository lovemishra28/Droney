import QRCode from "qrcode";

interface GenerateUpiOptions {
  vpa: string;
  payeeName: string;
  amountInRupees: number;
  transactionRef: string;
  note: string;
}

export function generateUpiString(options: GenerateUpiOptions): string {
  const { vpa, payeeName, amountInRupees, transactionRef, note } = options;
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amountInRupees.toFixed(2),
    cu: "INR",
    tr: transactionRef,
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export async function generateUpiQrDataUrl(upiString: string): Promise<string> {
  return await QRCode.toDataURL(upiString, {
    width: 320,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

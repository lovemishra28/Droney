import QRCode from "qrcode";

interface GenerateUpiOptions {
  vpa: string;
  payeeName: string;
  amountInRupees: number;
  transactionRef: string;
  note: string;
}

export function buildNpciUpiUri(params: {
  payeeAddress: string;
  payeeName: string;
  amountInr: string;
  transactionRef: string;
  transactionNote: string;
}): string {
  const {
    payeeAddress,
    payeeName,
    amountInr,
    transactionRef,
    transactionNote,
  } = params;

  const url = new URL("upi://pay");
  url.searchParams.set("pa", payeeAddress);
  url.searchParams.set("pn", payeeName);
  url.searchParams.set("am", amountInr);
  url.searchParams.set("tr", transactionRef);
  url.searchParams.set("tn", transactionNote);
  url.searchParams.set("cu", "INR");

  return url.toString();
}

export function generateUpiString(options: GenerateUpiOptions): string {
  const { vpa, payeeName, amountInRupees, transactionRef, note } = options;
  return buildNpciUpiUri({
    payeeAddress: vpa,
    payeeName,
    amountInr: amountInRupees.toFixed(2),
    transactionRef,
    transactionNote: note,
  });
}

export async function generateUpiQrDataUrl(upiString: string): Promise<string> {
  return await QRCode.toDataURL(upiString, {
    width: 320,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

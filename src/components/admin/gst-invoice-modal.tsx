"use client";

import React from "react";
import { Printer, X } from "lucide-react";
import { formatINR } from "@/lib/utils";

export interface InvoiceData {
  orderReference: string;
  createdAt: string;
  paymentMethod: string;
  upiTransactionId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  shippingAddress: {
    fullName: string;
    flatBuilding: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    unitPricePaise: number;
    isSecondHand: boolean;
  }>;
  totalAmountPaise: number;
}

interface GstInvoiceModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
}

export function GstInvoiceModal({ invoice, onClose }: GstInvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Base taxable amount calculated from inclusive 18% GST (Standard drone electronics rate)
  const totalAmountInr = invoice.totalAmountPaise / 100;
  const taxableAmountInr = totalAmountInr / 1.18;
  const totalGstInr = totalAmountInr - taxableAmountInr;

  // Inter-state check (Assuming business origin in Madhya Pradesh)
  const isInterState =
    (invoice.shippingAddress.state || "").trim().toLowerCase() !== "madhya pradesh";
  const igstInr = isInterState ? totalGstInr : 0;
  const cgstInr = isInterState ? 0 : totalGstInr / 2;
  const sgstInr = isInterState ? 0 : totalGstInr / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md print:p-0 print:bg-white">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl print:border-none print:bg-white print:text-black print:max-h-none print:overflow-visible">
        {/* Controls (Hidden during physical print) */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 print:hidden">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
            GST Tax Invoice Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-lime-500 dark:bg-[#c8f33b] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-lime-400 dark:hover:bg-[#b5e028] transition-colors shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="mt-4 print:mt-0 font-sans text-xs">
          {/* Header & Seller Data */}
          <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white print:text-black">
                ALTITUDE AVIATION INDIA
              </h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                Precision Drones, Parts & Certified Pre-Owned Systems
              </p>
              <p className="text-[11px] text-zinc-500 print:text-zinc-500 mt-1">
                GSTIN: 23AAAAA0000A1Z5 | PAN: AAAAA0000A
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block rounded border border-zinc-300 dark:border-zinc-800 print:border-zinc-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 print:text-zinc-800">
                Tax Invoice
              </span>
              <p className="mt-2 font-mono font-semibold text-sm text-zinc-900 dark:text-zinc-200 print:text-black">
                #{invoice.orderReference}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                Date: {new Date(invoice.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          {/* Billing & Shipping Destination */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-zinc-500">
                Billed / Shipped To:
              </span>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-200 print:text-black">
                {invoice.shippingAddress.fullName}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                {invoice.shippingAddress.flatBuilding}, {invoice.shippingAddress.street}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                {invoice.shippingAddress.city}, {invoice.shippingAddress.state} -{" "}
                {invoice.shippingAddress.pincode}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 print:text-zinc-600">
                Contact: {invoice.customerPhone || "N/A"}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-zinc-500">
                Settlement Particulars:
              </span>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300 print:text-zinc-800">
                Method: Direct UPI QR
              </p>
              <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                UTR: {invoice.upiTransactionId || "Verified by Merchant"}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 print:text-emerald-700 font-semibold mt-1">
                Payment Status: Cleared / Paid
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mt-4">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 text-[10px] uppercase text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                <tr>
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">HSN</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Rate (₹)</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 print:divide-zinc-200 text-zinc-800 dark:text-zinc-200 print:text-black">
                {invoice.items.map((item, index) => {
                  const lineTotalInr = (item.unitPricePaise * item.quantity) / 100;
                  return (
                    <tr key={index}>
                      <td className="py-2.5">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                        {item.isSecondHand && (
                          <span className="text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-400 print:text-amber-800">
                            Pre-Owned Certified Component
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center font-mono text-[11px] text-zinc-500 print:text-zinc-600">
                        8806
                      </td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">
                        {(item.unitPricePaise / 100).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {lineTotalInr.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Total Summary */}
          <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pt-3">
            <div className="ml-auto w-64 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                <span>Taxable Value:</span>
                <span className="font-mono">₹{taxableAmountInr.toFixed(2)}</span>
              </div>

              {isInterState ? (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                  <span>IGST (18%):</span>
                  <span className="font-mono">₹{igstInr.toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{cgstInr.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{sgstInr.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pt-2 text-sm font-bold text-zinc-900 dark:text-white print:text-black">
                <span>Total Amount:</span>
                <span>{formatINR(invoice.totalAmountPaise)}</span>
              </div>
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pt-4 text-[10px] text-zinc-500 print:text-zinc-600 flex justify-between items-end">
            <div>
              <p>This is a computer-generated tax invoice. No physical signature required.</p>
              <p className="mt-0.5">Thank you for flying with Altitude Aviation India.</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-zinc-800 dark:text-zinc-300 print:text-black">For Altitude Aviation India</p>
              <p className="mt-6 text-[9px] uppercase">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

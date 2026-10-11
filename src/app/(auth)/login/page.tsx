"use client";

import { useState } from "react";
import { Plane, ShieldCheck, ArrowRight } from "lucide-react";
import { requestOtp, verifyOtpAndLogin } from "@/server/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestOtp(identifier);
      setStep("verify");
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOtpAndLogin(identifier, otp, fullName);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <Plane className="h-6 w-6 rotate-45" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-100">
            Passwordless Pilot Authentication
          </h2>
          <p className="mt-1.5 text-xs text-zinc-400">
            Enter your Indian mobile (+91) or email to receive a 6-digit secure
            code.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {step === "input" ? (
          <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Full Name (Optional if existing user)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohit Sharma"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Mobile Number or Email Address
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+91 98765 43210 or pilot@domain.com"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              <span>{loading ? "Sending Code..." : "Dispatch Secure OTP"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-center font-mono text-xl tracking-widest text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-center text-[11px] text-zinc-500">
                Code sent to {identifier}. Valid for 5 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Enter Hangar"}
            </button>

            <button
              type="button"
              onClick={() => setStep("input")}
              className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200"
            >
              Change phone/email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

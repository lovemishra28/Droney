"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  completeRegistrationAction,
  requestOtpAction,
  verifyOtpAction,
} from "@/server/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [requiresName, setRequiresName] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const currentIdentifier =
    authMethod === "phone" ? `+91${phoneDigits.trim()}` : emailInput.trim();

  // Send / Request OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (authMethod === "phone" && phoneDigits.trim().length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (authMethod === "email" && !emailInput.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await requestOtpAction({ identifier: currentIdentifier });
      if (!res.success) {
        setError(res.message || "Failed to dispatch verification code.");
      } else {
        setOtpSent(true);
        setResendTimer(30);
        setInfoMessage(
          `Verification code sent to ${
            authMethod === "phone" ? `+91 ${phoneDigits}` : emailInput
          }`
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP and complete login
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpSent) {
      setError("Please request an OTP first.");
      return;
    }

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setVerifying(true);
    try {
      const res = await verifyOtpAction({
        identifier: currentIdentifier,
        otp: otp.trim(),
        fullName: undefined,
      });

      if (!res.success) {
        setError(res.message || "Verification failed. Please try again.");
        return;
      }

      if (res.data?.requiresName) {
        setRequiresName(true);
        setOtp("");
        setInfoMessage("OTP verified. Enter your name to finish creating your account.");
        return;
      }

      // Navigate to destination
      const callbackUrl = searchParams.get("callbackUrl");
      let destination = "/";
      if (res.data?.role === "admin") {
        destination =
          callbackUrl && callbackUrl.startsWith("/admin")
            ? callbackUrl
            : "/admin";
      } else {
        destination =
          callbackUrl && !callbackUrl.startsWith("/admin") ? callbackUrl : "/";
      }

      window.location.assign(
        new URL(destination, window.location.origin).toString()
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError("Please enter your full name to complete registration.");
      return;
    }

    setVerifying(true);
    try {
      const res = await completeRegistrationAction({
        identifier: currentIdentifier,
        fullName,
      });

      if (!res.success) {
        setError(res.message || "Could not complete registration.");
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl");
      const destination =
        callbackUrl && !callbackUrl.startsWith("/admin") ? callbackUrl : "/";
      window.location.assign(new URL(destination, window.location.origin).toString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration error.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 bg-white">
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6 lg:mb-0">
        <Link href="/" className="lg:hidden inline-flex items-center">
          <span className="font-tech text-2xl font-bold tracking-[0.05em] text-black uppercase">
            ALTITUDE
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-zinc-500 hover:text-black transition flex items-center gap-1 ml-auto"
        >
          <span>← Back to Store</span>
        </Link>
      </div>

      {/* Main Auth Form Container */}
      <div className="w-full max-w-md mx-auto my-auto space-y-6 py-6">
        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {requiresName ? "Finish creating your account" : mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            {requiresName
              ? "Enter your name to finish signing in."
              : mode === "signup"
              ? "Enter your details to register as an Altitude pilot."
              : "Please enter your details to sign in."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 font-medium flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 font-medium flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {requiresName ? (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rohit Sharma"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition shadow-2xs font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || fullName.trim().length < 2}
              className="w-full rounded-lg bg-black text-white py-3 text-sm font-bold font-tech tracking-wider uppercase transition hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {verifying ? "Creating account..." : "Continue"}
            </button>
          </form>
        ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          {/* Phone / Email Input Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">
              Phone Number
            </label>

            {authMethod === "phone" ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-zinc-600 select-none border-r border-zinc-200 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneDigits}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setPhoneDigits(cleaned);
                    }}
                    placeholder="Enter 10-digit number"
                    className="w-full rounded-lg border border-zinc-300 bg-white pl-13 pr-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={
                    sendingOtp || resendTimer > 0 || phoneDigits.length < 10
                  }
                  className="shrink-0 rounded-lg border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2.5 text-xs font-bold text-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {sendingOtp
                    ? "Sending..."
                    : resendTimer > 0
                      ? `Resend (${resendTimer}s)`
                      : otpSent
                        ? "Resend OTP"
                        : "Request OTP"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="pilot@domain.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={
                    sendingOtp || resendTimer > 0 || !emailInput.includes("@")
                  }
                  className="shrink-0 rounded-lg border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2.5 text-xs font-bold text-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {sendingOtp
                    ? "Sending..."
                    : resendTimer > 0
                      ? `Resend (${resendTimer}s)`
                      : otpSent
                        ? "Resend OTP"
                        : "Request OTP"}
                </button>
              </div>
            )}
          </div>

          {/* One-Time Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">
              One-Time Password
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter the 6-digit OTP sent to your phone"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-mono tracking-widest text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition shadow-2xs"
            />
          </div>

          {/* Primary CTA Button (Altitude Theme Style) */}
          <button
            type="submit"
            disabled={verifying || otp.length < 6 || !otpSent}
            className="w-full rounded-lg bg-black text-white py-3 text-sm font-bold font-tech tracking-wider uppercase transition hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 active:scale-[0.99] mt-2 cursor-pointer"
          >
            {verifying ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>
                {mode === "signup" ? "Create Account & Sign In" : "Log In"}
              </span>
            )}
          </button>
        </form>
        )}

        {/* Legal Disclaimer */}
        <div className="pt-4 border-t border-zinc-100 text-center text-[11px] text-zinc-400 leading-relaxed">
          By continuing, you agree to Altitude&apos;s{" "}
          <Link href="/terms" className="underline hover:text-zinc-700">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-zinc-700">
            Privacy Policy
          </Link>
          .
        </div>
      </div>

      {/* Footer Branding for Desktop */}
      <div className="w-full max-w-md mx-auto hidden lg:flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
          <span>256-bit encrypted authentication</span>
        </div>
        <span>Altitude Hangar</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-[#c8f33b] selection:text-black">
      {/* 1. Left Side: Moody Cinematic Drone Aerial Forest Panel (Matching Reference) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[48%] flex-col justify-between p-12 xl:p-16 text-white overflow-hidden bg-zinc-950">
        {/* Background Aerial Drone Forest Photograph */}
        <Image
          src="/images/login-aerial-forest.jpg"
          alt="Altitude Aerial Drone Forest"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />

        {/* Ambient Dark Scrim for optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/60 pointer-events-none" />

        {/* Brand Logo at Top-Left */}
        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2 group w-fit"
        >
          <span className="font-tech text-3xl font-bold tracking-[0.08em] text-white uppercase group-hover:text-zinc-200 transition">
            ALTITUDE
          </span>
        </Link>

        {/* Inspiring Center Statement matching reference */}
        <div className="relative z-10 max-w-md my-auto space-y-4">
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight font-tech uppercase">
            Take your creativity to new heights.
          </h1>
          <p className="text-sm xl:text-base text-zinc-300 leading-relaxed font-normal">
            Log in to manage your orders, access exclusive deals, and explore the
            latest in aerial technology.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10 text-xs text-zinc-400 font-medium">
          © {new Date().getFullYear()} Altitude Aerospace Technologies. All
          rights reserved.
        </div>
      </div>

      {/* 2. Right Side: Clean Light Theme Authentication Form */}
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center p-12">
            <span className="h-8 w-8 rounded-full border-2 border-zinc-300 border-t-black animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

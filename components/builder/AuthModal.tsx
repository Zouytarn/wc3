"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle,
} from "@/lib/supabase";

type Tab = "signin" | "signup";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    if (tab === "signup") {
      const { error: err } = await signUpWithPassword(email.trim(), password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        setInfo("Account created! Check your email to confirm, then sign in.");
        setTab("signin");
      }
    } else {
      const { error: err } = await signInWithPassword(email.trim(), password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        onSuccess();
        onClose();
      }
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithGoogle();
    setLoading(false);
    if (err) setError(err);
    // Google redirects — no need to call onSuccess here
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="w-full max-w-sm bg-[#0e0e1a] border border-white/[0.10] rounded-2xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Save your build orders to the cloud</h2>
          <p className="text-xs text-white/40">
            Free account — sync builds across devices and never lose your work.
          </p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.10] transition-all text-sm text-white/80 font-medium disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-[10px] text-white/25 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border border-white/[0.08] text-xs">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setInfo(null); }}
              className={cn(
                "flex-1 py-2 font-medium transition-colors",
                tab === t
                  ? "bg-amber-500/20 text-amber-300"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              {t === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-2">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Email"
            className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/25"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Password"
            className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/25"
          />
        </div>

        {/* Feedback */}
        {error && <p className="text-xs text-red-400">{error}</p>}
        {info  && <p className="text-xs text-emerald-400">{info}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 disabled:opacity-40 transition-all"
        >
          {loading
            ? "Please wait…"
            : tab === "signin"
            ? "Sign in"
            : "Create free account"}
        </button>

        <button
          onClick={onClose}
          className="w-full text-xs text-white/20 hover:text-white/50 transition-colors pt-1"
        >
          Continue without account
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

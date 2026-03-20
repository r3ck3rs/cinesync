"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "var(--bg)" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,111,247,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="w-full max-w-[380px] rounded-3xl p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
        }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <span
              className="font-display text-3xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #f0f0f8 0%, #9b8ef7 50%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CineSync
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Welkom terug
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-150"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,111,247,0.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,111,247,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-150"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,111,247,0.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,111,247,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <p
              className="text-xs px-3 py-2 rounded-lg"
              style={{ color: "#f87171", background: "rgba(248,113,113,0.1)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: loading
                ? "var(--overlay)"
                : "linear-gradient(135deg, #7c6ff7 0%, #ec4899 100%)",
              boxShadow: loading ? "none" : "0 4px 20px rgba(124,111,247,0.3)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Bezig..." : "Inloggen"}
          </button>
        </form>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "var(--muted)" }}
        >
          Nog geen account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold transition-colors"
            style={{ color: "#9b8ef7" }}
          >
            Registreer
          </Link>
        </p>
      </div>
    </main>
  );
}

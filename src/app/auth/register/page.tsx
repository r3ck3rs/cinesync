"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff", fontFamily: "sans-serif" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Check je e-mail</h2>
        <p style={{ color: "#888", textAlign: "center", maxWidth: "360px", padding: "0 1rem" }}>
          We hebben een bevestigingslink gestuurd naar <strong style={{ color: "#fff" }}>{email}</strong>.
        </p>
        <a href="/auth/login" style={{ marginTop: "2rem", color: "#e11d48" }}>Terug naar inloggen</a>
      </main>
    );
  }

  return (
    <main style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>🎬 CineSync</h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>Account aanmaken</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "360px", padding: "0 1rem" }}>
        <input
          type="email"
          placeholder="E-mailadres"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff", fontSize: "1rem" }}
        />
        <input
          type="password"
          placeholder="Wachtwoord (min. 6 tekens)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff", fontSize: "1rem" }}
        />

        {error && <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.75rem", borderRadius: "8px", background: "#e11d48", color: "#fff", fontWeight: "bold", fontSize: "1rem", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Bezig..." : "Registreer"}
        </button>

        <p style={{ textAlign: "center", color: "#888", fontSize: "0.9rem" }}>
          Al een account?{" "}
          <a href="/auth/login" style={{ color: "#e11d48" }}>Inloggen</a>
        </p>
      </form>
    </main>
  );
}

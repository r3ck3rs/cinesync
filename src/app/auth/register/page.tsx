"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film, Mail, Lock, User, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { signUp, checkUsernameAvailable } from "@/lib/supabase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
  });

  async function handleUsernameChange(value: string) {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setFormData((prev) => ({ ...prev, username: sanitized }));
    setError(null);

    if (sanitized.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const isAvailable = await checkUsernameAvailable(sanitized);
    setUsernameStatus(isAvailable ? "available" : "taken");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "username") {
      handleUsernameChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (formData.username.length < 3) {
      setError("Gebruikersnaam moet minimaal 3 tekens zijn");
      return;
    }

    if (formData.password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens zijn");
      return;
    }

    if (usernameStatus === "taken") {
      setError("Deze gebruikersnaam is al in gebruik");
      return;
    }

    startTransition(async () => {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        fullName: formData.fullName || undefined,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
    });
  }

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Check je inbox</h1>
            <p className="text-gray-400">
              We hebben een bevestigingslink gestuurd naar{" "}
              <span className="text-white font-medium">{formData.email}</span>
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Klik op de link in de e-mail om je account te activeren.
          </p>
          <Link
            href="/auth/login"
            className="inline-block text-brand-500 hover:text-brand-400 font-medium text-sm"
          >
            Terug naar inloggen
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <header className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <Film className="w-8 h-8 text-brand-500" />
            Cine<span className="text-brand-500">Sync</span>
          </Link>
          <p className="text-gray-400">Maak een gratis account aan</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Gebruikersnaam
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                value={formData.username}
                onChange={handleChange}
                placeholder="filmfan_123"
                className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
              />
              {usernameStatus !== "idle" && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking" && (
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                  )}
                  {usernameStatus === "available" && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {usernameStatus === "taken" && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">Kleine letters, cijfers en underscores</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
              Volledige naam <span className="text-gray-600">(optioneel)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jan de Vries"
                className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="naam@voorbeeld.nl"
                className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimaal 6 tekens"
                className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || usernameStatus === "taken"}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Account aanmaken...
              </>
            ) : (
              "Account aanmaken"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Al een account?{" "}
          <Link href="/auth/login" className="text-brand-500 hover:text-brand-400 font-medium">
            Inloggen
          </Link>
        </p>
      </div>
    </main>
  );
}

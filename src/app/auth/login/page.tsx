"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Film, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error") === "callback";

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError ? "Er ging iets mis bij het inloggen. Probeer opnieuw." : null
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <header className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <Film className="w-8 h-8 text-brand-500" />
            Cine<span className="text-brand-500">Sync</span>
          </Link>
          <p className="text-gray-400">Log in op je account</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

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
                autoComplete="current-password"
                required
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
            disabled={isPending}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Inloggen...
              </>
            ) : (
              "Inloggen"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Nog geen account?{" "}
          <Link href="/auth/register" className="text-brand-500 hover:text-brand-400 font-medium">
            Registreren
          </Link>
        </p>
      </div>
    </main>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, AtSign, FileText, Camera, Loader2, Check, X, LogOut } from "lucide-react";
import { updateProfile, checkUsernameAvailable, signOut, type Profile } from "@/lib/supabase/auth";

interface ProfileFormProps {
  profile: Profile;
  email: string;
}

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "unchanged">("unchanged");

  const [formData, setFormData] = useState({
    username: profile.username,
    fullName: profile.full_name || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatar_url || "",
  });

  async function handleUsernameChange(value: string) {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setFormData((prev) => ({ ...prev, username: sanitized }));
    setError(null);
    setSuccess(false);

    if (sanitized === profile.username) {
      setUsernameStatus("unchanged");
      return;
    }

    if (sanitized.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const isAvailable = await checkUsernameAvailable(sanitized);
    setUsernameStatus(isAvailable ? "available" : "taken");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === "username") {
      handleUsernameChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null);
      setSuccess(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.username.length < 3) {
      setError("Gebruikersnaam moet minimaal 3 tekens zijn");
      return;
    }

    if (usernameStatus === "taken") {
      setError("Deze gebruikersnaam is al in gebruik");
      return;
    }

    startTransition(async () => {
      const result = await updateProfile(profile.id, {
        username: formData.username,
        full_name: formData.fullName || null,
        bio: formData.bio || null,
        avatar_url: formData.avatarUrl || null,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
      setUsernameStatus("unchanged");
      router.refresh();
    });
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            Profiel bijgewerkt
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative">
            {formData.avatarUrl ? (
              <Image
                src={formData.avatarUrl}
                alt={formData.fullName || formData.username}
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-600 hover:bg-brand-700 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{formData.fullName || formData.username}</p>
            <p className="text-sm text-gray-500">@{formData.username}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300">
            Avatar URL
          </label>
          <div className="relative">
            <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">
            Gebruikersnaam
          </label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
            />
            {usernameStatus !== "idle" && usernameStatus !== "unchanged" && (
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
            Volledige naam
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="fullName"
              name="fullName"
              type="text"
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
              type="email"
              value={email}
              disabled
              className="w-full bg-surface-elevated/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500">E-mailadres kan niet worden gewijzigd</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
            Bio
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 w-5 h-5 text-gray-500" />
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={200}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Vertel iets over jezelf..."
              className="w-full bg-surface-elevated border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow resize-none"
            />
          </div>
          <p className="text-xs text-gray-500 text-right">{formData.bio.length}/200</p>
        </div>

        <button
          type="submit"
          disabled={isPending || usernameStatus === "taken"}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Opslaan...
            </>
          ) : (
            "Opslaan"
          )}
        </button>
      </form>

      <div className="border-t border-white/10 pt-6">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uitloggen...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Uitloggen
            </>
          )}
        </button>
      </div>
    </div>
  );
}

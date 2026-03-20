export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  const stats = [
    { label: "Plans", value: "0" },
    { label: "Vrienden", value: "0" },
    { label: "Films", value: "0" },
  ];

  const menuItems = [
    {
      href: "/plans",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
        </svg>
      ),
      label: "Mijn plans",
    },
    {
      href: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      label: "Vrienden",
    },
    {
      href: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
      label: "Notificaties",
    },
    {
      href: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      label: "Instellingen",
    },
  ];

  return (
    <main
      className="min-h-screen pb-28"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "rgba(8,8,17,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Feed
          </Link>
          <h1 className="font-display font-bold text-base">Profiel</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Avatar + info */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-display font-black text-white mb-4"
            style={{
              background: "linear-gradient(135deg, #7c6ff7 0%, #ec4899 100%)",
              boxShadow: "0 8px 32px rgba(124,111,247,0.3)",
            }}
          >
            {initials}
          </div>
          <p className="font-semibold text-base mb-1" style={{ color: "var(--text)" }}>
            {user.email}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Lid sinds{" "}
            {new Date(user.created_at).toLocaleDateString("nl-NL", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="font-display font-black text-2xl mb-1"
                style={{
                  background: "linear-gradient(135deg, #9b8ef7, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Menu items */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {menuItems.map((item, i) => {
            const isLast = i === menuItems.length - 1;
            const inner = (
              <div
                className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-white/[0.03]"
                style={!isLast ? { borderBottom: "1px solid var(--border)" } : {}}
              >
                <span className="flex items-center gap-3">
                  <span style={{ color: "var(--muted)" }}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--subtle)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.label} href={item.href}>
                  {inner}
                </Link>
              );
            }
            return (
              <button key={item.label} className="w-full text-left">
                {inner}
              </button>
            );
          })}
        </div>

        {/* Sign out */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-150 hover:opacity-80"
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#f87171",
            }}
          >
            Uitloggen
          </button>
        </form>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}

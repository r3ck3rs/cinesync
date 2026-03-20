import Link from "next/link";

function FilmIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="28" height="20" rx="3" stroke="url(#g)" strokeWidth="2"/>
      <rect x="2" y="10" width="4" height="4" fill="url(#g)" rx="0.5"/>
      <rect x="2" y="18" width="4" height="4" fill="url(#g)" rx="0.5"/>
      <rect x="26" y="10" width="4" height="4" fill="url(#g)" rx="0.5"/>
      <rect x="26" y="18" width="4" height="4" fill="url(#g)" rx="0.5"/>
      <line x1="14" y1="6" x2="14" y2="26" stroke="url(#g)" strokeWidth="1.5"/>
      <line x1="18" y1="6" x2="18" y2="26" stroke="url(#g)" strokeWidth="1.5"/>
      <defs>
        <linearGradient id="g" x1="2" y1="6" x2="30" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c6ff7"/>
          <stop offset="1" stopColor="#ec4899"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Plan delen",
    desc: "Stuur je bioscoopplan direct naar vrienden.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Vrienden uitnodigen",
    desc: "Nodig iedereen uit met één tik.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 11l10-9 10 9"/>
        <path d="M4 10v9a1 1 0 0 0 1 1h5v-5h4v5h5a1 1 0 0 0 1-1v-9"/>
        <path d="M7 20v-5h3v5"/>
      </svg>
    ),
    title: "Samen naar de film",
    desc: "Kies een film en ga er spontaan op uit.",
  },
];

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,111,247,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center flex-1 px-6 py-24 text-center z-10">
        {/* Logo mark */}
        <div className="mb-8">
          <FilmIcon />
        </div>

        {/* Title */}
        <h1
          className="font-display text-6xl sm:text-8xl font-black tracking-tight mb-5 leading-none"
          style={{
            background: "linear-gradient(135deg, #f0f0f8 0%, #9b8ef7 40%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CineSync
        </h1>

        <p
          className="text-base sm:text-xl mb-12 max-w-xs leading-relaxed"
          style={{ color: "var(--muted)", fontWeight: 400 }}
        >
          Go to the movies together —{" "}
          <span style={{ color: "var(--text)" }}>spontaneously.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <Link
            href="/auth/register"
            className="relative px-8 py-3.5 rounded-2xl font-semibold text-base text-white text-center overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c6ff7 0%, #ec4899 100%)",
              boxShadow: "0 4px 32px rgba(124,111,247,0.35)",
            }}
          >
            Registreren
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 rounded-2xl font-semibold text-base text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-md)",
              color: "var(--text)",
            }}
          >
            Inloggen
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-5 pb-16 z-10">
        <div className="max-w-sm mx-auto space-y-3">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-5 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(124,111,247,0.12)",
                  color: "#9b8ef7",
                }}
              >
                {icon}
              </div>
              <div>
                <h3
                  className="font-semibold text-sm mb-0.5"
                  style={{ color: "var(--text)" }}
                >
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="pb-8 text-center text-xs z-10"
        style={{ color: "var(--subtle)" }}
      >
        &copy; {new Date().getFullYear()} CineSync · Rotterdam
      </footer>
    </main>
  );
}

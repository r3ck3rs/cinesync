import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif" }}>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        <div className="text-6xl mb-6">🎬</div>
        <h1
          className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4"
          style={{
            background: "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CineSync
        </h1>
        <p className="text-lg sm:text-2xl mb-10 max-w-xl" style={{ color: "#9ca3af" }}>
          Go to the movies together — spontaneously.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none sm:justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 text-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #db2777)",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
            }}
          >
            Registreren
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 text-center"
            style={{
              background: "transparent",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            Inloggen
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "📣", title: "Plan delen", desc: "Stuur je bioscoopplan direct naar vrienden." },
            { icon: "👥", title: "Vrienden uitnodigen", desc: "Nodig iedereen uit met één tik." },
            { icon: "🎟️", title: "Samen naar de film", desc: "Kies een film en ga er spontaan op uit." },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-6 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-4xl mb-3">{icon}</span>
              <h3 className="font-semibold text-lg mb-1" style={{ color: "#f3f4f6" }}>{title}</h3>
              <p className="text-sm" style={{ color: "#6b7280" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-8 text-center text-xs" style={{ color: "#374151" }}>
        &copy; {new Date().getFullYear()} CineSync
      </footer>
    </main>
  );
}

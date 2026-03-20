import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Home, Search, Plus, User, Film } from "lucide-react";

export default async function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <main className="flex-1">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around px-4 py-2">
          <NavLink href="/" icon={Home} label="Feed" active />
          <NavLink href="/movies" icon={Film} label="Films" />
          <Link
            href="/plans/new"
            className="flex items-center justify-center w-12 h-12 -mt-6 bg-brand-600 hover:bg-brand-700 rounded-full shadow-lg shadow-brand-600/30 transition-colors"
          >
            <Plus className="w-6 h-6 text-white" />
          </Link>
          <NavLink href="/discover" icon={Search} label="Ontdek" />
          <NavLink href="/profile" icon={User} label="Profiel" />
        </div>
      </nav>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 transition-colors py-2 px-3 ${
        active ? "text-brand-500" : "text-gray-500 hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Link>
  );
}

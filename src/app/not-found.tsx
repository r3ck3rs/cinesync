import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">🎬</p>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-300 mb-2">Pagina niet gevonden</p>
        <p className="text-gray-500 mb-8">
          Deze pagina bestaat niet of is verplaatst.
        </p>
        <Link
          href="/"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          ← Terug naar home
        </Link>
      </div>
    </main>
  );
}

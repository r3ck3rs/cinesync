"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">🎭</p>
        <h1 className="text-2xl font-bold mb-2">Er ging iets mis</h1>
        <p className="text-gray-400 mb-8">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full font-medium transition-colors hover:opacity-80" style={{background:"var(--text)",color:"var(--bg)"}}
          >
            Opnieuw proberen
          </button>
          <Link
            href="/"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-full font-medium transition-colors"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    </main>
  );
}

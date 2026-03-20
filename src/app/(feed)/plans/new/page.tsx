"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    movie: "",
    cinema: "",
    date: "",
    time: "",
    audience: "friends" as "friends" | "extended" | "public",
    note: "",
  });

  const audienceOptions = [
    { value: "friends", label: "👥 Vrienden", desc: "Alleen je directe vrienden" },
    { value: "extended", label: "🌐 Extended", desc: "Vrienden van vrienden" },
    { value: "public", label: "🌍 Publiek", desc: "Iedereen op CineSync" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Terug
          </button>
          <h1 className="text-xl font-bold">🎬 Plan aanmaken</h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-purple-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Welke film?</h2>
              <input
                type="text"
                placeholder="Zoek een film..."
                value={form.movie}
                onChange={(e) => setForm({ ...form, movie: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bioscoop</label>
              <input
                type="text"
                placeholder="Bijv. Pathé Rotterdam"
                value={form.cinema}
                onChange={(e) => setForm({ ...form, cinema: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button
              onClick={() => form.movie && form.cinema && setStep(2)}
              disabled={!form.movie || !form.cinema}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
            >
              Volgende →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Wanneer?</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Datum</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tijd</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => form.date && form.time && setStep(3)}
              disabled={!form.date || !form.time}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
            >
              Volgende →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Wie mag meedoen?</h2>
              <div className="space-y-3">
                {audienceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, audience: opt.value as typeof form.audience })}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      form.audience === opt.value
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-400">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bericht (optioneel)</label>
              <textarea
                placeholder="Bijv. wie wil mee naar deze thriller?"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-900 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Film</span>
                <span className="font-medium">{form.movie}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bioscoop</span>
                <span>{form.cinema}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Datum & tijd</span>
                <span>{form.date} {form.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Publiek</span>
                <span>{audienceOptions.find(o => o.value === form.audience)?.label}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/feed")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              🎟️ Plan publiceren
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

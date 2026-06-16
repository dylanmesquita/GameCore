"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface RatingSummary {
  average: number;
  count: number;
  userRating: number;
}

/** Avaliação por estrelas (1–5) com média da comunidade GameCore. */
export function StarRating({ gameId }: { gameId: number }) {
  const { user, openAuth } = useAuth();
  const [summary, setSummary] = useState<RatingSummary>({ average: 0, count: 0, userRating: 0 });
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/ratings?gameId=${gameId}`)
      .then((r) => r.json())
      .then((data) => {
        if (active && !data.error) setSummary(data);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [gameId, user]);

  const rate = async (value: number) => {
    if (!user) {
      openAuth("login");
      return;
    }
    // Clicar de novo na mesma nota remove a avaliação.
    const next = summary.userRating === value ? 0 : value;
    setSaving(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, value: next }),
      });
      const data = await res.json();
      if (res.ok) setSummary(data);
    } catch {
      /* erro silencioso — estado permanece consistente com o servidor */
    } finally {
      setSaving(false);
    }
  };

  const display = hover || summary.userRating;

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/6">
      <h3 className="text-[10px] font-mono font-bold text-zinc-600 mb-4 uppercase tracking-[0.2em]">
        Avaliação da Comunidade
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-zinc-600" />
        </div>
      ) : (
        <>
          {/* Média */}
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-extrabold tracking-tighter text-white tabular-nums">
              {summary.average ? summary.average.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-zinc-600 font-mono mb-1.5">
              {summary.count} {summary.count === 1 ? "voto" : "votos"}
            </span>
          </div>

          {/* Estrelas interativas */}
          <div className="flex items-center gap-1 mb-3" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                disabled={saving}
                onMouseEnter={() => setHover(n)}
                onClick={() => rate(n)}
                aria-label={`Dar ${n} estrela${n > 1 ? "s" : ""}`}
                className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Star
                  size={26}
                  className={`transition-colors ${
                    n <= display ? "text-[#CBFF4E]" : "text-zinc-700 hover:text-zinc-500"
                  }`}
                  fill={n <= display ? "currentColor" : "none"}
                />
              </button>
            ))}
            {saving && <Loader2 size={14} className="animate-spin text-zinc-600 ml-2" />}
          </div>

          <p className="text-[11px] text-zinc-600 font-light leading-relaxed">
            {!user
              ? "Faça login para avaliar este jogo."
              : summary.userRating
              ? `Sua nota: ${summary.userRating}/5 · clique de novo para remover`
              : "Toque nas estrelas para dar sua nota."}
          </p>
        </>
      )}
    </div>
  );
}

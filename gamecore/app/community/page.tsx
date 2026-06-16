"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Star, MessageSquare, Loader2, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const API_KEY = "2843b69740b44def938ac6a8fe2b5c9f";
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RecentComment {
  id: string;
  gameId: number;
  authorName: string;
  body: string;
  createdAt: string;
}
interface TopRated {
  gameId: number;
  average: number;
  count: number;
}
interface GameMeta {
  id: number;
  name: string;
  background_image: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CommunityPage() {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [topRated, setTopRated] = useState<TopRated[]>([]);
  const [meta, setMeta] = useState<Record<number, GameMeta>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/community")
      .then((r) => r.json())
      .then(async (data) => {
        if (!active) return;
        const c: RecentComment[] = data.recentComments || [];
        const t: TopRated[] = data.topRated || [];
        setComments(c);
        setTopRated(t);

        // Resolve nomes e imagens dos jogos citados no feed (RAWG).
        const ids = Array.from(new Set([...c.map((x) => x.gameId), ...t.map((x) => x.gameId)]));
        const entries = await Promise.all(
          ids.map((id) =>
            fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`)
              .then((r) => r.json())
              .then(
                (g) =>
                  [id, { id, name: g.name || `Jogo #${id}`, background_image: g.background_image || "" }] as const
              )
              .catch(() => [id, { id, name: `Jogo #${id}`, background_image: "" }] as const)
          )
        );
        if (active) setMeta(Object.fromEntries(entries));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#CBFF4E]/[0.03] blur-[140px] pointer-events-none z-0 rounded-full" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24">
        <div className="mb-12">
          <p className="text-[#CBFF4E] text-xs font-mono font-bold tracking-[0.25em] uppercase mb-4">
            ▸ GameCore juntos
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter flex items-center gap-4">
            <Users className="text-zinc-700" size={40} />
            Comunidade
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-zinc-600" size={28} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Mais bem avaliados pela comunidade */}
            <section className="lg:col-span-2">
              <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-600 mb-6 flex items-center gap-2">
                <TrendingUp size={13} />
                Mais bem avaliados
              </h2>

              {topRated.length === 0 ? (
                <p className="text-sm text-zinc-600 font-light py-4">
                  Ainda não há jogos avaliados. Seja o primeiro a dar uma nota!
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {topRated.map((t, index) => {
                    const g = meta[t.gameId];
                    return (
                      <motion.div
                        key={t.gameId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: index * 0.04, ease }}
                      >
                        <Link
                          href={`/game/${t.gameId}`}
                          className="group block bg-[#050505] rounded-xl border border-white/[0.06] overflow-hidden hover:border-[#CBFF4E]/20 transition-colors"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-[#0A0A0A]">
                            {g?.background_image ? (
                              <img
                                src={g.background_image}
                                alt={g.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-mono font-bold text-black bg-[#CBFF4E] px-2 py-0.5 rounded-full">
                              <Star size={9} fill="currentColor" />
                              {t.average.toFixed(1)}
                            </span>
                          </div>
                          <div className="p-3">
                            <h3 className="text-xs font-bold tracking-tight text-white line-clamp-1 group-hover:text-[#CBFF4E] transition-colors">
                              {g?.name || `Jogo #${t.gameId}`}
                            </h3>
                            <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                              {t.count} {t.count === 1 ? "voto" : "votos"}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Atividade recente */}
            <section>
              <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-600 mb-6 flex items-center gap-2">
                <MessageSquare size={13} />
                Atividade recente
              </h2>

              {comments.length === 0 ? (
                <p className="text-sm text-zinc-600 font-light py-4">
                  Nenhuma conversa por aqui ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c, index) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.03, ease }}
                    >
                      <Link
                        href={`/game/${c.gameId}`}
                        className="group block p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 flex items-center justify-center flex-shrink-0">
                            {initials(c.authorName)}
                          </span>
                          <span className="text-xs font-semibold text-zinc-200 truncate">
                            {c.authorName}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono ml-auto flex-shrink-0">
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 font-light leading-relaxed line-clamp-2 break-words">
                          {c.body}
                        </p>
                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider mt-2 group-hover:text-[#CBFF4E] transition-colors">
                          em {meta[c.gameId]?.name || `Jogo #${c.gameId}`}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

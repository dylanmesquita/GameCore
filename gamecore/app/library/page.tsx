"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Library as LibraryIcon, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth, type SaveGamePayload } from "@/components/AuthProvider";

interface SavedGame extends SaveGamePayload {
  addedAt: string;
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function LibraryPage() {
  const { user, loading: authLoading, openAuth, toggleSave } = useAuth();
  const [games, setGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/saves")
      .then((r) => r.json())
      .then((data) => setGames(data.saves || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const remove = async (game: SavedGame) => {
    setGames((prev) => prev.filter((g) => g.gameId !== game.gameId));
    try {
      await toggleSave(game);
    } catch {
      /* mantém a remoção otimista */
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#CBFF4E]/[0.03] blur-[140px] pointer-events-none z-0 rounded-full" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24">
        <div className="mb-12">
          <p className="text-[#CBFF4E] text-xs font-mono font-bold tracking-[0.25em] uppercase mb-4">
            ▸ Sua coleção
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter flex items-center gap-4">
            <LibraryIcon className="text-zinc-700" size={40} />
            Minha Biblioteca
          </h1>
        </div>

        {authLoading || loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-zinc-600" size={28} />
          </div>
        ) : !user ? (
          <div className="py-24 text-center">
            <p className="text-zinc-500 mb-6 font-light">
              Faça login para ver os jogos que você salvou.
            </p>
            <button
              onClick={() => openAuth("login")}
              className="text-xs font-bold tracking-widest uppercase bg-[#CBFF4E] text-black px-6 py-3 rounded-full hover:bg-[#d4ff6b] transition-all"
            >
              Entrar
            </button>
          </div>
        ) : games.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-zinc-600 font-mono text-sm tracking-widest uppercase mb-6">
              Nenhum jogo salvo ainda
            </p>
            <Link
              href="/"
              className="text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-zinc-300 px-6 py-3 rounded-full hover:border-white/25 transition-all"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {games.map((game, index) => (
                <motion.div
                  key={game.gameId}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, delay: index * 0.04, ease }}
                  className="group relative"
                >
                  <button
                    onClick={() => remove(game)}
                    aria-label="Remover da biblioteca"
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:border-red-500 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>

                  <Link
                    href={`/game/${game.gameId}`}
                    className="block bg-[#050505] rounded-xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-colors"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0A0A0A]">
                      <img
                        src={game.background_image || ""}
                        alt={game.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold tracking-tight text-white line-clamp-1">
                          {game.name}
                        </h3>
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold shrink-0 text-[#CBFF4E]">
                          <Star size={9} fill="currentColor" />
                          {game.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

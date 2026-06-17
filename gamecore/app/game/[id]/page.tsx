"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Comments } from "@/components/Comments";
import { SaveButton } from "@/components/SaveButton";
import { StarRating } from "@/components/StarRating";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface GameDetails {
  id: number;
  name: string;
  description_raw: string;
  background_image: string;
  rating: number;
  released: string;
  developers: { name: string }[];
  platforms: { platform: { name: string } }[];
  genres: { name: string }[];
}

export default function GamePage() {
  const params = useParams();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`https://api.rawg.io/api/games/${params.id}?key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        setGame(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes:", err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-white/10 border-t-[#CBFF4E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-600 font-mono text-sm tracking-widest uppercase">Jogo não encontrado.</p>
      </div>
    );
  }

  const ratingColor = game.rating >= 4.5 ? "#CBFF4E" : game.rating >= 4.0 ? "#FBBF24" : "#71717A";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Back nav */}
      <nav className="fixed top-0 w-full z-50 p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors duration-200 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">Catálogo</span>
        </Link>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-[65vh] md:h-[82vh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease }}
          className="absolute inset-0"
        >
          <img
            src={game.background_image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </motion.div>

        <div className="absolute bottom-0 w-full px-6 pb-10 md:px-16 md:pb-14 max-w-6xl">
          {/* Genre tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease }}
            className="flex gap-2 mb-4"
          >
            {game.genres?.slice(0, 3).map((g) => (
              <span
                key={g.name}
                className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded border border-white/10 text-zinc-500"
              >
                {g.name}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.9, ease }}
            className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-5 leading-none"
          >
            {game.name}
          </motion.h1>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease }}
            className="flex flex-wrap items-center gap-4"
          >
            {/* Rating */}
            <span
              className="flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1.5 rounded-full border"
              style={{ color: ratingColor, borderColor: `${ratingColor}30`, backgroundColor: `${ratingColor}10` }}
            >
              <Star size={12} fill="currentColor" />
              {game.rating.toFixed(1)}
            </span>

            {/* Developer */}
            {game.developers?.[0] && (
              <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Users size={12} className="text-zinc-600" />
                {game.developers[0].name}
              </span>
            )}

            {/* Release date */}
            {game.released && (
              <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Calendar size={12} className="text-zinc-600" />
                {new Date(game.released).getFullYear()}
              </span>
            )}

            {/* Salvar na biblioteca */}
            <SaveButton
              variant="full"
              className="ml-1"
              game={{
                gameId: game.id,
                name: game.name,
                background_image: game.background_image,
                rating: game.rating,
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left column */}
        <div className="md:col-span-2 space-y-10">
          <section>
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-600 mb-4">
              Sobre o Jogo
            </h2>
            <p className="text-zinc-400 leading-relaxed font-light text-[15px]">
              {game.description_raw
                ? game.description_raw.slice(0, 800) + (game.description_raw.length > 800 ? "..." : "")
                : "Nenhuma descrição disponível."}
            </p>
          </section>

          {/* Community discussion */}
          <Comments gameId={game.id} />
        </div>

        {/* Right column */}
        <aside className="space-y-6">
          {/* Avaliação por estrelas da comunidade GameCore */}
          <StarRating gameId={game.id} />

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/6">
            <h3 className="text-[10px] font-mono font-bold text-zinc-600 mb-4 uppercase tracking-[0.2em]">
              Plataformas
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.platforms?.map((p) => (
                <span
                  key={p.platform.name}
                  className="px-3 py-1 rounded-full border border-white/8 text-[11px] text-zinc-500 font-medium"
                >
                  {p.platform.name}
                </span>
              ))}
            </div>
          </div>

          {game.developers?.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/6">
              <h3 className="text-[10px] font-mono font-bold text-zinc-600 mb-4 uppercase tracking-[0.2em]">
                Desenvolvedor
              </h3>
              {game.developers.map((d) => (
                <p key={d.name} className="text-sm text-zinc-300 font-medium">{d.name}</p>
              ))}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

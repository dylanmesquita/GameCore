"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Plus } from "lucide-react";
import Link from "next/link";

export interface Game {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  genres: { name: string }[];
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const getGlowColor = (rating: number) => {
  if (rating >= 4.5) return "rgba(203, 255, 78, 0.12)";
  if (rating >= 4.0) return "rgba(251, 191, 36, 0.10)";
  return "rgba(100, 100, 100, 0.08)";
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "text-[#CBFF4E]";
  if (rating >= 4.0) return "text-amber-400";
  return "text-zinc-500";
};

interface GameGridProps {
  games: Game[];
  loading: boolean;
}

export function GameGrid({ games, loading }: GameGridProps) {
  const [hoveredGameId, setHoveredGameId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-xl bg-white/[0.03] border border-white/5 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-[-45deg]"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: i * 0.1 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-600 font-mono text-sm tracking-widest uppercase">Nenhum resultado encontrado</p>
      </div>
    );
  }

  return (
    <div
      className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      onMouseLeave={() => setHoveredGameId(null)}
    >
      <AnimatePresence>
        {games.map((game, index) => {
          const isHovered = hoveredGameId === game.id;
          const isAnyHovered = hoveredGameId !== null;
          const isDimmed = isAnyHovered && !isHovered;

          return (
            /* Entrance wrapper — staggered on load */
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease }}
            >
              {/* Hover dimming wrapper */}
              <motion.div
                onMouseEnter={() => setHoveredGameId(game.id)}
                animate={{
                  opacity: isDimmed ? 0.25 : 1,
                  scale: isDimmed ? 0.97 : 1,
                  filter: isDimmed ? "grayscale(80%) blur(1.5px)" : "grayscale(0%) blur(0px)",
                }}
                transition={{ duration: 0.35, ease }}
                className="relative"
                style={{ zIndex: isHovered ? 50 : 10 }}
              >
                {/* Ambient Glow */}
                <motion.div
                  className="absolute inset-0 -z-10 rounded-xl blur-2xl pointer-events-none"
                  style={{ backgroundColor: getGlowColor(game.rating) }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                />

                <Link href={`/game/${game.id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[#CBFF4E]/50 rounded-xl">
                  <motion.div
                    animate={{ y: isHovered ? -8 : 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="group relative flex flex-col bg-[#050505] rounded-xl border border-white/[0.06] overflow-hidden cursor-pointer h-full hover:border-white/10 transition-colors duration-500"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0A0A0A]">
                      <motion.img
                        src={game.background_image || "/api/placeholder/400/500"}
                        alt={game.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        animate={{ scale: isHovered ? 1.06 : 1 }}
                        transition={{ duration: 0.9, ease }}
                      />

                      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700 ${isHovered ? "opacity-100" : "opacity-70"}`} />

                      {/* Hover UI */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              console.log(`Jogo ${game.id} adicionado aos favoritos`);
                            }}
                            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-[#CBFF4E] hover:text-black hover:border-[#CBFF4E] transition-all duration-200"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="flex justify-center mb-6">
                          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 ease-out">
                            <Play size={18} className="text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card info */}
                    <div className="p-4 bg-[#050505] group-hover:bg-[#080808] transition-colors duration-500 flex-1 flex flex-col justify-end">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="text-sm font-bold tracking-tight text-white line-clamp-1">
                          {game.name}
                        </h3>
                        <span className={`flex items-center gap-1 text-[11px] font-mono font-bold shrink-0 ${getRatingColor(game.rating)}`}>
                          <Star size={9} fill="currentColor" />
                          {game.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-700 line-clamp-1 uppercase tracking-[0.15em] font-medium">
                        {game.genres?.map((g) => g.name).join(" · ") || "—"}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

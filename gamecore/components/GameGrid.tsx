"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Plus } from "lucide-react";
import { Game } from "@/types/game"; // Ajuste o caminho conforme necessário

const premiumEasing = [0.16, 1, 0.3, 1];

// Brilho sutil baseado na nota
const getGlowColor = (rating: number) => {
  if (rating >= 4.5) return "rgba(255, 215, 0, 0.15)";
  if (rating >= 4.0) return "rgba(255, 255, 255, 0.1)";
  return "rgba(100, 100, 100, 0.1)";
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
          <div key={i} className="aspect-[4/5] rounded-xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-45deg]"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return <div className="py-20 text-center text-zinc-500">Nenhum registro encontrado nos arquivos centrais.</div>;
  }

  return (
    <div 
      className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      onMouseLeave={() => setHoveredGameId(null)}
    >
      <AnimatePresence>
        {games.map((game) => {
          const isHovered = hoveredGameId === game.id;
          const isAnyHovered = hoveredGameId !== null;
          const isDimmed = isAnyHovered && !isHovered;

          return (
            <motion.div
              key={game.id}
              onMouseEnter={() => setHoveredGameId(game.id)}
              animate={{
                opacity: isDimmed ? 0.3 : 1,
                scale: isDimmed ? 0.98 : 1,
                filter: isDimmed ? "grayscale(80%) blur(2px)" : "grayscale(0%) blur(0px)",
              }}
              transition={{ duration: 0.4, ease: premiumEasing }}
              className="relative z-10"
              style={{ zIndex: isHovered ? 50 : 10 }}
            >
              <motion.div
                className="absolute inset-0 -z-10 rounded-xl blur-2xl transition-opacity duration-500"
                style={{ backgroundColor: getGlowColor(game.rating) }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
              />

              <motion.div
                animate={{ y: isHovered ? -8 : 0 }}
                transition={{ duration: 0.4, ease: premiumEasing }}
                className="group relative flex flex-col bg-[#050505] rounded-xl border border-white/5 overflow-hidden cursor-pointer h-full"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#0A0A0A] border-b border-white/5">
                  <motion.img
                    src={game.background_image || "/api/placeholder/400/500"}
                    alt={game.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.8, ease: premiumEasing }}
                  />

                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700 ${isHovered ? "opacity-100" : "opacity-60"}`} />

                  <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex justify-end">
                      <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 ease-out">
                        <Play size={20} className="text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#050505] group-hover:bg-[#0A0A0A] transition-colors duration-500 flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-sm font-semibold tracking-tight text-white line-clamp-1">
                      {game.name}
                    </h3>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                      <Star size={10} className="text-zinc-500" fill="currentColor" />
                      {game.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-1 uppercase tracking-widest font-medium">
                    {game.genres?.map(g => g.name).join(", ") || "Desconhecido"}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
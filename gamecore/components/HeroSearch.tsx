"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const stats = [
  { value: "500K+", label: "títulos" },
  { value: "4K+", label: "estúdios" },
  { value: "40+", label: "gêneros" },
];

export function HeroSearch({ searchQuery, setSearchQuery }: HeroSearchProps) {
  return (
    <section className="mb-12 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="text-[#CBFF4E] text-xs font-mono font-bold tracking-[0.25em] uppercase mb-4"
        >
          ▸ Catálogo Global
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease }}
          className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-[0.95]"
        >
          O ecossistema <br />
          <span className="text-zinc-600">definitivo de jogos.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease }}
          className="relative group max-w-xl mb-8"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={16} className="text-zinc-500 group-focus-within:text-[#CBFF4E] transition-colors duration-300" />
          </div>
          <input
            type="text"
            placeholder="Buscar títulos, estúdios ou coleções..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 focus:bg-white/[0.06] transition-all duration-300 shadow-2xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="flex items-center gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.5, ease }}
              className="flex items-baseline gap-1.5"
            >
              <span className="text-base font-mono font-bold text-white">{stat.value}</span>
              <span className="text-xs text-zinc-600 font-medium">{stat.label}</span>
            </motion.div>
          ))}
          <div className="h-3 w-px bg-white/10" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest"
          >
            via RAWG Database
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}

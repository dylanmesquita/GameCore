"use client";

import { motion } from "framer-motion";
import { Search, Command } from "lucide-react";

const premiumEasing = [0.16, 1, 0.3, 1];

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function HeroSearch({ searchQuery, setSearchQuery }: HeroSearchProps) {
  return (
    <section className="mb-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: premiumEasing }}>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight">
          O ecossistema <br />
          <span className="text-zinc-500">definitivo de jogos.</span>
        </h1>
        
        <div className="relative group max-w-xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-500 group-focus-within:text-white transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Buscar títulos, estúdios ou coleções..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-16 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-[#111] transition-all shadow-2xl"
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <div className="flex items-center gap-1 text-zinc-600 border border-white/10 px-2 py-1 rounded bg-black">
              <Command size={12} />
              <span className="text-[10px] font-mono font-bold">K</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
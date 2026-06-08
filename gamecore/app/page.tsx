"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { Game } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { HeroSearch } from "@/components/HeroSearch";
import { GameGrid } from "@/components/GameGrid";

const inter = Inter({ subsets: ["latin"] });
const API_KEY = "2843b69740b44def938ac6a8fe2b5c9f";

const GENRES = [
  { id: "", name: "Todos" },
  { id: "action", name: "Ação" },
  { id: "indie", name: "Indie" },
  { id: "role-playing-games-rpg", name: "RPG" },
  { id: "strategy", name: "Estratégia" },
  { id: "shooter", name: "Shooter" },
];

export default function GameCore() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("");

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=16&ordering=-rating`;
      if (searchQuery) url += `&search=${searchQuery}`;
      if (activeGenre) url += `&genres=${activeGenre}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setGames(data.results || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erro na API:", err);
          setLoading(false);
        });
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeGenre]);

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className} selection:bg-white/20`}>
      {/* Background Noise & Blur */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] pointer-events-none z-0 rounded-full" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24">
        <HeroSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Filtros de Categoria */}
        <section className="mb-10 flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                activeGenre === genre.id 
                  ? "bg-white text-black" 
                  : "bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </section>

        <GameGrid games={games} loading={loading} />
      </main>

      <footer className="border-t border-white/5 bg-black/50 py-12 mt-12 text-center relative z-10">
        <p className="text-xs text-zinc-600 font-medium tracking-wide">
          &copy; 2026 GameCore Inc. Integração oficial via RAWG Database.
        </p>
      </footer>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Game } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { HeroSearch } from "@/components/HeroSearch";
import { GameGrid } from "@/components/GameGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 40; // máximo permitido pela RAWG API
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

const GENRES = [
  { id: "", name: "Todos" },
  { id: "action", name: "Ação" },
  { id: "indie", name: "Indie" },
  { id: "role-playing-games-rpg", name: "RPG" },
  { id: "strategy", name: "Estratégia" },
  { id: "shooter", name: "Shooter" },
];

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function GameCore() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeGenre]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=${PAGE_SIZE}&page=${currentPage}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}&search_precise=true`;
      } else {
        url += `&ordering=-rating`;
      }
      if (activeGenre) url += `&genres=${activeGenre}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setGames(data.results || []);
          setTotalCount(data.count || 0);
          setLoading(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch((err) => {
          console.error("Erro na API:", err);
          setLoading(false);
        });
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, activeGenre, currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern" />
      
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#CBFF4E]/[0.04] blur-[140px] pointer-events-none z-0 rounded-full" />
      
      <div className="fixed top-[30%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.04] blur-[160px] pointer-events-none z-0 rounded-full" />
      
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="fixed inset-0 z-0 pointer-events-none bg-scanlines opacity-40" />
      
      <div className="fixed inset-0 z-0 pointer-events-none bg-vignette" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24">
        <HeroSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Filtros de Categoria */}
        <section className="mb-10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                activeGenre === genre.id
                  ? "bg-[#CBFF4E] text-black shadow-[0_0_20px_rgba(203,255,78,0.25)]"
                  : "bg-transparent border border-white/10 text-zinc-500 hover:text-white hover:border-white/25"
              }`}
            >
              {genre.name}
            </button>
          ))}

          {/* Contagem total de resultados */}
          {!loading && totalCount > 0 && (
            <span className="ml-auto shrink-0 text-[11px] font-mono text-zinc-600 tracking-widest">
              {totalCount.toLocaleString("pt-BR")} jogos
            </span>
          )}
        </section>

        <GameGrid games={games} loading={loading} />

        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <nav className="mt-14 flex items-center justify-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/8 text-zinc-500 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Páginas */}
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-zinc-700 font-mono text-xs">
                  ···
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-mono font-bold transition-all duration-200 ${
                    p === currentPage
                      ? "bg-[#CBFF4E] text-black shadow-[0_0_16px_rgba(203,255,78,0.2)]"
                      : "border border-white/8 text-zinc-500 hover:text-white hover:border-white/20"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/8 text-zinc-500 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={14} />
            </button>
          </nav>
        )}

        {/* Indicador de página atual */}
        {!loading && totalPages > 1 && (
          <p className="mt-4 text-center text-[11px] font-mono text-zinc-700 tracking-widest">
            Página {currentPage} de {totalPages.toLocaleString("pt-BR")}
          </p>
        )}
      </main>

      <footer className="border-t border-white/5 bg-black/50 py-12 mt-12 text-center relative z-10">
        <p className="text-xs text-zinc-700 font-mono tracking-widest uppercase">
          &copy; 2026 GameCore Inc. · Powered by RAWG Database
        </p>
      </footer>
    </div>
  );
}

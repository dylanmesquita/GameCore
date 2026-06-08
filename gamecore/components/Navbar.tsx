"use client";

import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        scrolled ? "bg-black/70 backdrop-blur-xl border-white/10 py-4" : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-white">
            Game<span className="text-zinc-500">Core</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="text-white">Descobrir</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Biblioteca</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Comunidade</a>
          </nav>
        </div>
        <button className="text-xs font-medium bg-white text-black px-4 py-2 rounded-full hover:scale-105 transition-transform">
          Iniciar Sessão
        </button>
      </div>
    </header>
  );
}
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
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-white/8 py-4"
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="text-lg font-bold tracking-tighter">
            <span className="text-[#CBFF4E]">Game</span>
            <span className="text-white">Core</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-white relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#CBFF4E] after:rounded-full">
              Descobrir
            </a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">Biblioteca</a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">Comunidade</a>
          </nav>
        </div>
        <button className="text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-zinc-300 px-5 py-2.5 rounded-full hover:bg-[#CBFF4E] hover:text-black hover:border-[#CBFF4E] transition-all duration-300">
          Entrar
        </button>
      </div>
    </header>
  );
}

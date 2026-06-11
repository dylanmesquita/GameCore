"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Library, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, loading, openAuth, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
          <Link href="/" className="text-lg font-bold tracking-tighter">
            <span className="text-[#CBFF4E]">Game</span>
            <span className="text-white">Core</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-white relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#CBFF4E] after:rounded-full"
            >
              Descobrir
            </Link>
            <Link href="/library" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Biblioteca
            </Link>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Comunidade
            </a>
          </nav>
        </div>

        {loading ? (
          <div className="w-24 h-9 rounded-full bg-white/5 animate-pulse" />
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full pl-1.5 pr-4 py-1.5 hover:border-white/25 transition-all duration-300"
            >
              <span className="w-7 h-7 rounded-full bg-[#CBFF4E] text-black text-[11px] font-bold flex items-center justify-center">
                {initials || <UserIcon size={14} />}
              </span>
              <span className="text-xs font-semibold text-zinc-200 max-w-[120px] truncate">
                {user.name}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 shadow-2xl">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-600 truncate">{user.email}</p>
                </div>
                <Link
                  href="/library"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  <Library size={14} className="text-zinc-500" />
                  Minha biblioteca
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openAuth("login")}
            className="text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-zinc-300 px-5 py-2.5 rounded-full hover:bg-[#CBFF4E] hover:text-black hover:border-[#CBFF4E] transition-all duration-300"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}

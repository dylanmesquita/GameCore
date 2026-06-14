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
          <span className="text-lg font-bold tracking-tighter">
            <span className="text-[#CBFF4E]">Game</span>
            <span className="text-white">Core</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-white relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#CBFF4E] after:rounded-full">
              Descobrir
            </a>
            <a href="/library" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Biblioteca
            </a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Comunidade
            </a>
          </nav>
        </div>
        {user ? (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="flex items-center gap-3 text-sm font-medium bg-white/5 border border-white/10 text-zinc-300 px-4 py-2 rounded-full hover:bg-white/6 transition-all duration-200"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                {initials || <UserIcon size={14} />}
              </span>
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-lg p-2 shadow-lg z-50">
                <Link
                  href="/library"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 rounded"
                >
                  <Library size={16} />
                  Biblioteca
                </Link>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 rounded"
                >
                  <LogOut size={16} />
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

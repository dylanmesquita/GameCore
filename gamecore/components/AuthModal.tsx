"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function AuthModal() {
  const { authModal, closeAuth, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sincroniza o modo inicial sempre que o modal abre
  useEffect(() => {
    if (authModal.open) {
      setMode(authModal.mode);
      setError("");
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [authModal.open, authModal.mode]);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAuth();
    if (authModal.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authModal.open, closeAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {authModal.open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeAuth}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <button
              onClick={closeAuth}
              className="absolute top-5 right-5 text-zinc-600 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <p className="text-[#CBFF4E] text-xs font-mono font-bold tracking-[0.25em] uppercase mb-2">
              ▸ {mode === "login" ? "Acesso" : "Nova conta"}
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-white mb-6">
              {mode === "login" ? "Entrar na GameCore" : "Criar sua conta"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 transition-all"
                  placeholder="voce@email.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#CBFF4E] text-black font-bold text-sm py-3 rounded-xl hover:bg-[#d4ff6b] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-600 mt-6">
              {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="text-[#CBFF4E] font-semibold hover:underline"
              >
                {mode === "login" ? "Cadastre-se" : "Entrar"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

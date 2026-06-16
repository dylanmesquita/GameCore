"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Bookmark,
  Star,
  MessageSquare,
  Pencil,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  stats: { saved: number; ratings: number; comments: number };
}

export default function ProfilePage() {
  const { user, loading: authLoading, openAuth, updateProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Formulário de edição
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProfile = () => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadProfile();
  }, [user, authLoading]);

  const startEdit = () => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setCurrentPassword("");
    setNewPassword("");
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateProfile({
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setSuccess("Perfil atualizado com sucesso.");
      setEditing(false);
      setLoading(true);
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar.");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const stats = profile
    ? [
        { icon: Bookmark, label: "Na biblioteca", value: profile.stats.saved },
        { icon: Star, label: "Avaliações", value: profile.stats.ratings },
        { icon: MessageSquare, label: "Comentários", value: profile.stats.comments },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#CBFF4E]/[0.03] blur-[140px] pointer-events-none z-0 rounded-full" />

      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-36 pb-24">
        <p className="text-[#CBFF4E] text-xs font-mono font-bold tracking-[0.25em] uppercase mb-4">
          ▸ Sua conta
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter flex items-center gap-4 mb-12">
          <UserIcon className="text-zinc-700" size={40} />
          Meu Perfil
        </h1>

        {authLoading || loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-zinc-600" size={28} />
          </div>
        ) : !user ? (
          <div className="py-24 text-center">
            <p className="text-zinc-500 mb-6 font-light">
              Faça login para ver e ajustar o seu perfil.
            </p>
            <button
              onClick={() => openAuth("login")}
              className="text-xs font-bold tracking-widest uppercase bg-[#CBFF4E] text-black px-6 py-3 rounded-full hover:bg-[#d4ff6b] transition-all"
            >
              Entrar
            </button>
          </div>
        ) : !profile ? (
          <p className="text-zinc-600 font-mono text-sm tracking-widest uppercase py-12">
            Não foi possível carregar o perfil.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="space-y-8"
          >
            {/* Cartão de identidade */}
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#CBFF4E] text-black text-3xl font-extrabold flex items-center justify-center flex-shrink-0">
                {initials || <UserIcon size={36} />}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-extrabold tracking-tight">{profile.name}</h2>
                <p className="text-zinc-500 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail size={13} className="text-zinc-600" />
                  {profile.email}
                </p>
                <p className="text-zinc-600 text-xs font-mono mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                  <Calendar size={12} />
                  Membro desde {memberSince}
                </p>
              </div>
              {!editing && (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-zinc-300 px-5 py-2.5 rounded-full hover:border-white/25 transition-all"
                >
                  <Pencil size={13} />
                  Editar
                </button>
              )}
            </div>

            {success && (
              <p className="text-sm text-[#CBFF4E] bg-[#CBFF4E]/10 border border-[#CBFF4E]/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <Check size={15} />
                {success}
              </p>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/6 text-center"
                >
                  <Icon size={18} className="text-zinc-600 mx-auto mb-2" />
                  <p className="text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Formulário de edição */}
            {editing && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                onSubmit={submit}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/8 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-tight">Ajustar perfil</h3>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-zinc-600 hover:text-white transition-colors"
                    aria-label="Cancelar"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 transition-all"
                  />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3 mt-3">
                    Alterar senha (opcional)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                        Senha atual
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                        Nova senha
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CBFF4E]/40 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-[#CBFF4E] text-black font-bold text-sm py-3 px-6 rounded-xl hover:bg-[#d4ff6b] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    Salvar alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-sm font-bold text-zinc-400 py-3 px-6 rounded-xl border border-white/10 hover:border-white/25 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.form>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

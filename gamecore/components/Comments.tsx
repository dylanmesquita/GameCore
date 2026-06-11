"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldAlert, Trash2, Loader2, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface CommentItem {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  isOwner: boolean;
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

export function Comments({ gameId }: { gameId: number }) {
  const { user, openAuth } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/comments?gameId=${gameId}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setComments(data.comments || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [gameId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao publicar.");
      setComments((prev) => [data.comment, ...prev]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao publicar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Otimista
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (!res.ok) setComments(prev); // reverte em caso de erro
  };

  return (
    <section className="pt-10 border-t border-white/5">
      <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-600 mb-6 flex items-center gap-2">
        <MessageSquare size={12} />
        Discussão da Comunidade
        {!loading && (
          <span className="text-zinc-700 normal-case tracking-normal">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* Caixa de novo comentário */}
      {user ? (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex gap-4 mb-6"
        >
          <div className="w-9 h-9 rounded-full bg-[#CBFF4E] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
            {user.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compartilhe sua opinião sobre este jogo..."
              rows={2}
              className="w-full bg-transparent text-sm resize-none focus:outline-none text-zinc-200 placeholder:text-zinc-600 font-light"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            <div className="flex justify-end items-center mt-2 pt-2 border-t border-white/5">
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#CBFF4E] text-black px-4 py-1.5 rounded-full hover:bg-[#d4ff6b] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Publicar
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between mb-6">
          <span className="text-[11px] text-zinc-600 flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <ShieldAlert size={12} />
            Faça login para participar da discussão
          </span>
          <button
            onClick={() => openAuth("login")}
            className="text-xs font-bold bg-white/5 border border-white/10 text-zinc-300 px-4 py-1.5 rounded-full hover:bg-[#CBFF4E] hover:text-black hover:border-[#CBFF4E] transition-all"
          >
            Entrar
          </button>
        </div>
      )}

      {/* Lista de comentários */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={18} className="animate-spin text-zinc-600" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-600 font-light py-4">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease }}
                className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 flex items-center justify-center flex-shrink-0">
                  {c.authorName
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-zinc-200">{c.authorName}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">{timeAgo(c.createdAt)}</span>
                    {c.isOwner && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="ml-auto text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Excluir comentário"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed whitespace-pre-wrap break-words">
                    {c.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

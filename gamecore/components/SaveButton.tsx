"use client";

import { useState } from "react";
import { Plus, Check, Loader2, Bookmark } from "lucide-react";
import { useAuth, type SaveGamePayload } from "@/components/AuthProvider";

interface SaveButtonProps {
  game: SaveGamePayload;
  /** "icon" = botão circular (cards); "full" = botão com texto (página de detalhe). */
  variant?: "icon" | "full";
  className?: string;
}

export function SaveButton({ game, variant = "icon", className = "" }: SaveButtonProps) {
  const { user, openAuth, isSaved, toggleSave } = useAuth();
  const [loading, setLoading] = useState(false);
  const saved = isSaved(game.gameId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuth("login");
      return;
    }
    setLoading(true);
    try {
      await toggleSave(game);
    } catch {
      /* erro silencioso — estado permanece consistente com o servidor */
    } finally {
      setLoading(false);
    }
  };

  if (variant === "full") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full border transition-all duration-200 disabled:opacity-60 ${
          saved
            ? "bg-[#CBFF4E] text-black border-[#CBFF4E]"
            : "bg-white/5 text-zinc-200 border-white/10 hover:border-white/25"
        } ${className}`}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : saved ? (
          <Check size={15} />
        ) : (
          <Bookmark size={15} />
        )}
        {saved ? "Na biblioteca" : "Salvar jogo"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? "Remover dos salvos" : "Salvar jogo"}
      className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 ${
        saved
          ? "bg-[#CBFF4E] text-black border-[#CBFF4E]"
          : "bg-black/50 border-white/10 text-white hover:bg-[#CBFF4E] hover:text-black hover:border-[#CBFF4E]"
      } ${className}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : saved ? (
        <Check size={14} />
      ) : (
        <Plus size={14} />
      )}
    </button>
  );
}

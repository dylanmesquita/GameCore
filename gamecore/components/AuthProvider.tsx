"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface SaveGamePayload {
  gameId: number;
  name: string;
  background_image: string;
  rating: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Abre o modal de autenticação (login ou cadastro). */
  openAuth: (mode?: "login" | "signup") => void;
  closeAuth: () => void;
  authModal: { open: boolean; mode: "login" | "signup" };
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Conjunto de gameIds salvos pelo usuário (carregado uma vez). */
  savedIds: Set<number>;
  isSaved: (gameId: number) => boolean;
  /** Alterna o jogo na biblioteca. Retorna o novo estado (true = salvo). */
  toggleSave: (game: SaveGamePayload) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "signup" }>({
    open: false,
    mode: "login",
  });
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Carrega a sessão atual ao montar
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Carrega os jogos salvos sempre que o usuário muda
  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    fetch("/api/saves")
      .then((r) => r.json())
      .then((data) => {
        const ids = (data.saves || []).map((g: { gameId: number }) => g.gameId);
        setSavedIds(new Set(ids));
      })
      .catch(() => {});
  }, [user]);

  const isSaved = useCallback((gameId: number) => savedIds.has(gameId), [savedIds]);

  const toggleSave = useCallback(
    async (game: SaveGamePayload): Promise<boolean> => {
      if (!user) {
        setAuthModal({ open: true, mode: "login" });
        return false;
      }
      const res = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar.");
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (data.saved) next.add(game.gameId);
        else next.delete(game.gameId);
        return next;
      });
      return data.saved;
    },
    [user]
  );

  const openAuth = (mode: "login" | "signup" = "login") =>
    setAuthModal({ open: true, mode });
  const closeAuth = () => setAuthModal((s) => ({ ...s, open: false }));

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao entrar.");
    setUser(data.user);
    closeAuth();
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao criar conta.");
    setUser(data.user);
    closeAuth();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        openAuth,
        closeAuth,
        authModal,
        login,
        signup,
        logout,
        savedIds,
        isSaved,
        toggleSave,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

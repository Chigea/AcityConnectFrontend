import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, loadToken, saveToken } from "./api";
import type { UserPublic } from "./types";

type AuthState = {
  user: UserPublic | null;
  token: string | null;
  ready: boolean;
  loginFromResponse: (token: string, user: UserPublic) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setTok] = useState<string | null>(() => loadToken());
  const [ready, setReady] = useState(false);

  const refreshMe = useCallback(async () => {
    const t = loadToken();
    if (!t) {
      setUser(null);
      setTok(null);
      return;
    }
    try {
      const me = await apiFetch<UserPublic>("/api/users/me");
      setUser(me);
      setTok(loadToken());
    } catch {
      saveToken(null);
      setTok(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshMe().catch(() => null);
      setReady(true);
    })();
  }, [refreshMe]);

  const loginFromResponse = useCallback((newToken: string, u: UserPublic) => {
    saveToken(newToken);
    setTok(newToken);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    saveToken(null);
    setTok(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      loginFromResponse,
      logout,
      refreshMe,
    }),
    [loginFromResponse, logout, ready, refreshMe, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}

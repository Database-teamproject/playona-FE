import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  captureTokensFromLocation,
  clearSession,
  fetchCurrentUserSession,
  getStoredSession,
  isMockAuthEnabled,
  saveSession,
  startSocialLogin,
  type AuthSession,
  type SocialProvider,
} from "@/lib/auth";
import { authApi, getAccessToken } from "@/lib/api";

type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  session: AuthSession | null;
  loginWithProvider: (provider: SocialProvider) => void;
  logout: () => void;
  setSession: (session: AuthSession | null) => void;
  refreshSession: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  const writeSession = useCallback((nextSession: AuthSession | null) => {
    if (nextSession) saveSession(nextSession);
    else clearSession();
    setSessionState(nextSession);
  }, []);

  const refreshSession = useCallback(async (): Promise<AuthSession | null> => {
    if (!getAccessToken()) {
      setSessionState(null);
      return null;
    }
    const fresh = await fetchCurrentUserSession();
    setSessionState(fresh);
    return fresh;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      // 1. Pick up tokens from the OAuth callback URL, if any.
      captureTokensFromLocation();

      // 2. Restore cached session for immediate UI render.
      const cached = getStoredSession();
      if (cached) setSessionState(cached);

      // 3. If we have a token, fetch the live user.
      if (getAccessToken()) {
        const fresh = await fetchCurrentUserSession(
          cached?.user.provider ?? "kakao",
        );
        if (fresh) {
          setSessionState(fresh);
        } else if (!isMockAuthEnabled()) {
          clearSession();
          setSessionState(null);
        }
      } else if (!cached && isMockAuthEnabled()) {
        // mock mode: keep null until user clicks login
      }

      setIsReady(true);
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(session),
      isReady,
      session,
      loginWithProvider: (provider) => {
        const nextSession = startSocialLogin(provider);
        if (nextSession) writeSession(nextSession);
      },
      logout: () => {
        void authApi.logout().finally(() => writeSession(null));
      },
      setSession: writeSession,
      refreshSession,
    }),
    [isReady, session, writeSession, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};

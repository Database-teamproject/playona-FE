import {
  API_BASE_URL,
  clearTokens,
  getAccessToken,
  setTokens,
  userApi,
  type UserResponse,
} from "@/lib/api";

const AUTH_STORAGE_KEY = "playona_auth_session";

export type SocialProvider = "kakao" | "google" | "apple";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  profileImageUrl?: string;
  provider: SocialProvider;
};

export type AuthSession = {
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
};

export type SocialProviderConfig = {
  id: SocialProvider;
  label: string;
  loginLabel: string;
  accentColor: string;
  textColor: string;
};

export const SOCIAL_PROVIDERS: Record<SocialProvider, SocialProviderConfig> = {
  kakao: {
    id: "kakao",
    label: "카카오",
    loginLabel: "카카오로 시작하기",
    accentColor: "hsl(var(--kakao))",
    textColor: "#191600",
  },
  google: {
    id: "google",
    label: "Google",
    loginLabel: "Google로 시작하기",
    accentColor: "#ffffff",
    textColor: "#111827",
  },
  apple: {
    id: "apple",
    label: "Apple",
    loginLabel: "Apple로 시작하기",
    accentColor: "#111111",
    textColor: "#ffffff",
  },
};

export const getStoredSession = (): AuthSession | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const saveSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  clearTokens();
};

export const getProviderLabel = (provider: SocialProvider) =>
  SOCIAL_PROVIDERS[provider].label;

export const isSocialProvider = (
  provider: string | undefined,
): provider is SocialProvider =>
  Boolean(provider && provider in SOCIAL_PROVIDERS);

const envFlagEnabled = (value: string | undefined) =>
  value === "true" || value === "1";

/**
 * Mock auth is only enabled when explicitly opted-in via env flag.
 * (Was previously DEV-by-default which masked real backend bugs.)
 */
export const isMockAuthEnabled = () =>
  envFlagEnabled(import.meta.env.VITE_USE_MOCK_AUTH);

export const createMockSocialSession = (
  provider: SocialProvider = "kakao",
): AuthSession => {
  const providerLabel = getProviderLabel(provider);
  return {
    accessToken: `mock-${provider}-access-token`,
    refreshToken: `mock-${provider}-refresh-token`,
    user: {
      id: `${provider}-demo-user`,
      name: `${providerLabel} 테스트 사용자`,
      email: `${provider}-demo@playona.local`,
      provider,
    },
  };
};

const SPRING_OAUTH_PATH: Record<SocialProvider, string> = {
  kakao: "/oauth2/authorization/kakao",
  google: "/oauth2/authorization/google",
  apple: "/oauth2/authorization/apple",
};

const getLoginUrl = (provider: SocialProvider) => {
  const overrideMap: Record<SocialProvider, string | undefined> = {
    kakao: import.meta.env.VITE_KAKAO_LOGIN_URL,
    google: import.meta.env.VITE_GOOGLE_LOGIN_URL,
    apple: import.meta.env.VITE_APPLE_LOGIN_URL,
  };
  return overrideMap[provider] || `${API_BASE_URL}${SPRING_OAUTH_PATH[provider]}`;
};

export const startSocialLogin = (provider: SocialProvider) => {
  if (isMockAuthEnabled()) {
    const mockSession = createMockSocialSession(provider);
    saveSession(mockSession);
    return mockSession;
  }
  const loginUrl = getLoginUrl(provider);
  window.location.assign(loginUrl);
  return null;
};

export const userResponseToSession = (
  user: UserResponse,
  provider: SocialProvider = "kakao",
): AuthSession => ({
  accessToken: getAccessToken() ?? undefined,
  user: {
    id: user.userUuid,
    name: user.nickname || "사용자",
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    provider,
  },
});

/**
 * Pulls auth tokens from URL params (?accessToken=...&refreshToken=...) or
 * the hash (#accessToken=...). Returns true if tokens were extracted and saved.
 */
export const captureTokensFromLocation = (): boolean => {
  if (typeof window === "undefined") return false;

  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith("#")
    ? new URLSearchParams(window.location.hash.slice(1))
    : new URLSearchParams();

  const pick = (key: string) =>
    search.get(key) || hash.get(key) || undefined;

  const accessToken =
    pick("accessToken") || pick("access_token") || pick("token");
  const refreshToken =
    pick("refreshToken") || pick("refresh_token");

  if (!accessToken) return false;

  setTokens({ accessToken, refreshToken: refreshToken ?? null });

  // Strip the tokens from the URL so they don't linger in history.
  const cleanUrl =
    window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
  return true;
};

export const fetchCurrentUserSession = async (
  fallbackProvider: SocialProvider = "kakao",
): Promise<AuthSession | null> => {
  try {
    const user = await userApi.me();
    if (!user?.userUuid) return null;
    const session = userResponseToSession(user, fallbackProvider);
    saveSession(session);
    return session;
  } catch {
    return null;
  }
};

/**
 * Playona API client.
 * Backend: Playona Spring Boot service (OpenAPI 3.0.1).
 * Auth: Bearer JWT in `Authorization` header.
 */

const ACCESS_TOKEN_KEY = "playona_access_token";
const REFRESH_TOKEN_KEY = "playona_refresh_token";

const rawApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

// 빈 값이면 same-origin (Vite dev proxy 또는 같은 도메인에 백엔드가 있을 때).
// 채워져 있으면 cross-origin 호출 (프로덕션).
export const API_BASE_URL = (rawApiBase ?? "").replace(/\/+$/, "");

export const SHARE_BASE_URL =
  import.meta.env.VITE_SHARE_BASE_URL?.trim().replace(/\/+$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

/* ------------------------------------------------------------------ */
/* Token storage                                                       */
/* ------------------------------------------------------------------ */

export const getAccessToken = (): string | null =>
  typeof localStorage === "undefined"
    ? null
    : localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  typeof localStorage === "undefined"
    ? null
    : localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (tokens: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) => {
  if (tokens.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  } else if (tokens.accessToken === null) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else if (tokens.refreshToken === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  result?: string;
};

export type UserResponse = {
  userUuid: string;
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
  createdAt?: string;
};

export type UpdateUserRequest = {
  nickname?: string;
  profileImageUrl?: string;
};

export type PlatformPreferenceRequest = {
  platformId: number;
  priority: number;
};

export type PlatformPreferenceResponse = {
  platformId: number;
  platformName: string;
  priority: number;
};

export type LinkPlatformObject = {
  url?: string;
  name?: string;
  slug?: string;
  platform?: string;
  platformName?: string;
  thumbnailUrl?: string;
};

export type LinkPlatformEntry = Record<string, string> | LinkPlatformObject;

export type LinkResponse = {
  shortCode: string;
  trackTitle?: string;
  trackArtist?: string;
  thumbnailUrl?: string;
  clickCount?: number;
  shareUrl?: string;
  createdAt?: string;
  platforms?: LinkPlatformEntry[];
};

type BackendPlatformInfo = {
  id?: number;
  platformId?: number;
  name?: string;
  platformName?: string;
  slug?: string;
  logoUrl?: string | null;
  iconUrl?: string | null;
};

export type PlatformInfo = {
  platformId: number;
  platformName: string;
  slug?: string;
  iconUrl?: string;
};

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/* ------------------------------------------------------------------ */
/* Core fetch wrapper                                                  */
/* ------------------------------------------------------------------ */

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
  signal?: AbortSignal;
  /** Internal flag to avoid infinite refresh loops. */
  _retried?: boolean;
};

const buildUrl = (
  path: string,
  query?: Record<string, string | number | undefined>,
) => {
  const sameOriginBase =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const url = path.startsWith("http")
    ? new URL(path)
    : API_BASE_URL
      ? new URL(`${API_BASE_URL}${path}`)
      : new URL(path, sameOriginBase);

  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
};

let refreshPromise: Promise<boolean> | null = null;

const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(buildUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      const json = (await res.json()) as ApiResponse<Record<string, string>>;
      const next = json?.data ?? {};
      const access = next.accessToken || next.access_token;
      const refresh = next.refreshToken || next.refresh_token;
      if (!access) {
        clearTokens();
        return false;
      }
      setTokens({
        accessToken: access,
        refreshToken: refresh ?? refreshToken,
      });
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const request = async <T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> => {
  const { method = "GET", body, query, auth = true, signal } = opts;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // FormData는 브라우저가 multipart 경계를 포함해 Content-Type을 직접 설정한다.
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
    signal,
    credentials: "include",
  });

  if (res.status === 401 && auth && !opts._retried) {
    const ok = await refreshTokens();
    if (ok) {
      return request<T>(path, { ...opts, _retried: true });
    }
    clearTokens();
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const msg =
      (payload as { message?: string })?.message ||
      (typeof payload === "string" ? payload : null) ||
      `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload as T;
};

const unwrap = <T>(promise: Promise<ApiResponse<T>>): Promise<T> =>
  promise.then((res) => {
    if (res?.success === false) {
      throw new ApiError(
        res.message || "Request failed",
        0,
        res,
      );
    }
    return res.data;
  });

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

export const authApi = {
  refresh: () => refreshTokens(),
  logout: async () => {
    const refreshToken = getRefreshToken();
    try {
      await request<ApiResponse<unknown>>("/api/auth/logout", {
        method: "POST",
        body: refreshToken ? { refreshToken } : {},
        auth: true,
      });
    } finally {
      clearTokens();
    }
  },
};

export const userApi = {
  me: () =>
    unwrap(request<ApiResponse<UserResponse>>("/api/users/me")),
  update: (payload: UpdateUserRequest) =>
    unwrap(
      request<ApiResponse<UserResponse>>("/api/users/me", {
        method: "PUT",
        body: payload,
      }),
    ),
  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return unwrap(
      request<ApiResponse<UserResponse>>("/api/users/me/profile-image", {
        method: "POST",
        body: form,
      }),
    );
  },
  myPlatforms: () =>
    unwrap(
      request<ApiResponse<PlatformPreferenceResponse[]>>(
        "/api/users/me/platforms",
      ),
    ),
  updatePlatforms: (payload: PlatformPreferenceRequest[]) =>
    request<ApiResponse<PlatformPreferenceResponse[]> | undefined>(
      "/api/users/me/platforms",
      { method: "PUT", body: payload },
    ).then((res) => {
      if (!res) return [];
      if (res.success === false) {
        throw new ApiError(res.message || "Request failed", 0, res);
      }
      return res.data ?? [];
    }),
};

export const platformApi = {
  list: () =>
    unwrap(
      request<ApiResponse<BackendPlatformInfo[] | Record<string, BackendPlatformInfo>>>(
        "/api/platforms",
        { auth: false },
      ),
    ).then((data) => {
      const list = Array.isArray(data)
        ? data
        : data && typeof data === "object"
          ? Object.values(data)
          : [];

      return list
        .map<PlatformInfo | null>((platform) => {
          const platformId = platform.platformId ?? platform.id;
          const platformName =
            platform.platformName ?? platform.name ?? platform.slug;

          if (!platformId || !platformName) return null;

          return {
            platformId,
            platformName,
            slug: platform.slug,
            iconUrl: platform.iconUrl ?? platform.logoUrl ?? undefined,
          } satisfies PlatformInfo;
        })
        .filter((platform): platform is PlatformInfo => Boolean(platform));
    }),
};

export const linkApi = {
  create: (originalUrl: string) =>
    unwrap(
      request<ApiResponse<LinkResponse>>("/api/links", {
        method: "POST",
        body: { url: originalUrl },
        auth: Boolean(getAccessToken()),
      }),
    ),
  get: (shortCode: string) =>
    unwrap(
      request<ApiResponse<LinkResponse>>(
        `/api/links/${encodeURIComponent(shortCode)}`,
        { auth: false },
      ),
    ),
  getPlatformUrls: (shortCode: string) =>
    unwrap(
      request<ApiResponse<LinkPlatformEntry | LinkPlatformEntry[]>>(
        `/api/links/${encodeURIComponent(shortCode)}/platforms`,
        { auth: false },
      ),
    ),
  /**
   * /redirect 를 호출해 클릭수만 집계한다.
   * 이 엔드포인트는 JSON(`{ url }` 또는 플랫폼 배열)을 반환하는 API이므로
   * 페이지 이동에 직접 사용하지 않는다. 호출 후 프론트가 가진 실제 플랫폼
   * URL로 이동한다. keepalive 로 페이지 전환 중에도 요청이 유지되게 한다.
   */
  trackClick: (shortCode: string) => {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(
      `${API_BASE_URL}/api/links/${encodeURIComponent(shortCode)}/redirect`,
      { headers, keepalive: true, credentials: "include" },
    ).catch(() => {
      /* 집계 실패해도 이동은 진행 */
    });
  },
  my: () =>
    unwrap(
      request<ApiResponse<LinkResponse[] | { items?: LinkResponse[] }>>(
        "/api/links/my",
      ),
    ).then((data) =>
      Array.isArray(data) ? data : (data?.items ?? []),
    ),
  delete: (shortCode: string) =>
    request<ApiResponse<unknown>>(
      `/api/links/${encodeURIComponent(shortCode)}`,
      { method: "DELETE" },
    ),
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Flatten the LinkResponse `platforms` field — backend returns an array of
 * single-entry objects like `[{ spotify: "https://..." }, { melon: "..." }]`.
 */
export const flattenPlatformEntries = (
  entries: LinkPlatformEntry[] | LinkPlatformEntry | undefined,
): Array<{ platform: string; url: string }> => {
  if (!entries) return [];
  const list = Array.isArray(entries) ? entries : [entries];
  const out: Array<{ platform: string; url: string }> = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;

    if ("url" in entry && typeof entry.url === "string" && entry.url) {
      const platform =
        entry.slug ||
        entry.name ||
        entry.platform ||
        entry.platformName ||
        "unknown";
      out.push({ platform, url: entry.url });
      continue;
    }

    for (const [key, value] of Object.entries(entry)) {
      if (typeof value === "string" && value) {
        out.push({ platform: key, url: value });
      }
    }
  }
  return out;
};

export const buildShareUrl = (shortCode: string) =>
  `${SHARE_BASE_URL.replace(/\/$/, "")}/s/${shortCode}`;

/**
 * Map any backend-supplied platform name (SPOTIFY, "YouTube Music", melon_kr…)
 * to the icon-key understood by PlatformIcon.
 */
export const normalizePlatformKey = (raw: string): string => {
  const v = raw.toLowerCase().replace(/[\s_-]+/g, "");
  if (v.includes("spotify")) return "spotify";
  if (v.includes("youtubemusic") || v === "ytmusic" || v === "ytm")
    return "ytmusic";
  if (v.includes("applemusic") || v === "apple") return "apple";
  if (v.includes("melon")) return "melon";
  if (v.includes("youtube")) return "youtube";
  if (v.includes("flo")) return "flo";
  if (v.includes("genie") || v.includes("지니")) return "genie";
  return v;
};

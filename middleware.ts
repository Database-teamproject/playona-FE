/**
 * Vercel Routing Middleware.
 *
 * /t/:shortCode 공유 페이지에 곡별 OG 태그를 서버에서 주입한다.
 * 카카오톡·iMessage 등 링크 미리보기 크롤러는 JavaScript를 실행하지 않으므로,
 * SPA가 렌더링되기 전의 정적 HTML에 메타 태그가 들어 있어야 미리보기가 뜬다.
 *
 * 실제 사용자는 평소대로 SPA를 받고, 크롤러는 곡 커버·제목 미리보기를 받는다.
 */

export const config = {
  matcher: "/t/:path*",
};

// 서버 사이드에서 백엔드를 호출할 주소. Vercel 프로젝트 환경변수로 주입한다.
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://43.201.139.24:8080";

type LinkMeta = {
  trackTitle?: string;
  trackArtist?: string;
  thumbnailUrl?: string;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fetchLinkMeta = async (shortCode: string): Promise<LinkMeta | null> => {
  try {
    const res = await fetch(
      `${BACKEND_ORIGIN}/api/links/${encodeURIComponent(shortCode)}`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as LinkMeta;
  } catch {
    return null;
  }
};

const buildMeta = (meta: LinkMeta | null, pageUrl: string, origin: string) => {
  const title =
    meta?.trackTitle && meta?.trackArtist
      ? `${meta.trackTitle} · ${meta.trackArtist}`
      : meta?.trackTitle || "Playona — 음악을 공유하는 가장 쉬운 방법";
  const description = meta?.trackTitle
    ? "모든 플랫폼에서 이 곡을 들어보세요 — Playona"
    : "어떤 음악 링크든 모든 플랫폼에서 열리는 하나의 링크로 변환하세요.";
  const image = meta?.thumbnailUrl || `${origin}/pwa-512x512.png`;

  const tags = [
    `<meta property="og:type" content="music.song" />`,
    `<meta property="og:site_name" content="Playona" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ].join("\n    ");

  return { title, tags };
};

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // SPA 셸 HTML을 가져온다. (/index.html 은 matcher에 안 걸려 재귀하지 않는다)
  const shellRes = await fetch(new URL("/index.html", url.origin));
  let html = await shellRes.text();

  const match = url.pathname.match(/^\/t\/([^/]+)\/?$/);
  if (match) {
    const meta = await fetchLinkMeta(match[1]);
    const { title, tags } = buildMeta(meta, url.href, url.origin);

    // index.html의 정적 OG/twitter 메타를 제거하고 곡별 태그로 교체.
    html = html
      .replace(
        /\s*<meta\s+(?:property|name)="(?:og:|twitter:)[^"]*"[^>]*>/g,
        "",
      )
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace("</head>", `    ${tags}\n  </head>`);
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // 미리보기 크롤러용으로 CDN에 짧게 캐시.
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}

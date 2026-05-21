import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Copy,
  Check,
  ExternalLink,
  LoaderCircle,
  Music,
  MousePointerClick,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PlatformIcon, { getPlatformConfig } from "@/components/PlatformIcon";
import {
  ApiError,
  buildShareUrl,
  flattenPlatformEntries,
  linkApi,
  normalizePlatformKey,
  type LinkResponse,
} from "@/lib/api";

const ResultPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const location = useLocation();
  const preloaded = (location.state as { link?: LinkResponse } | null)?.link;

  const [link, setLink] = useState<LinkResponse | null>(preloaded ?? null);
  const [isLoading, setIsLoading] = useState(!preloaded);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shortCode) return;
    if (preloaded?.shortCode === shortCode) {
      setLink(preloaded);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await linkApi.get(shortCode);
        if (!cancelled) setLink(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "링크 정보를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shortCode, preloaded]);

  const platforms = useMemo(
    () =>
      flattenPlatformEntries(link?.platforms).map((entry) => ({
        key: normalizePlatformKey(entry.platform),
        rawName: entry.platform,
        url: entry.url,
      })),
    [link?.platforms],
  );

  const shareUrl =
    link?.shareUrl ||
    (shortCode ? buildShareUrl(shortCode) : "");
  const shareUrlDisplay = shareUrl.replace(/^https?:\/\//, "");

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("링크가 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  };

  // 네이티브 공유 시트(Web Share API) — iOS·Android 모두 지원.
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleShare = async () => {
    if (!shareUrl) return;
    // Web Share API는 메시지를 1건만 전달할 수 있어 두 건으로 나눌 수 없다.
    // 일부 앱은 title/text/url 필드를 구분자 없이 이어붙여 링크 인식을 깨므로,
    // text 한 필드에만 담는다. 링크를 첫 줄에 단독으로 둬야 인식이 된다.
    const trackLine = [link?.trackTitle, link?.trackArtist]
      .filter(Boolean)
      .join(" · ");
    const lines = [shareUrl, ""];
    if (trackLine) lines.push(trackLine);
    lines.push("Shared via Playona 🎵");
    try {
      await navigator.share({ text: lines.join("\n") });
    } catch (err) {
      // 사용자가 공유 시트를 닫으면 AbortError — 정상 흐름이므로 무시.
      if ((err as Error)?.name !== "AbortError") {
        toast.error("공유에 실패했습니다.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">링크 정보를 불러오는 중…</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Music className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">
            {error ?? "링크를 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 앨범 아트 기반 앰비언트 배경 글로우 */}
      {link.thumbnailUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[440px]"
        >
          <div
            className="absolute inset-0 scale-125 bg-cover bg-center opacity-30 blur-3xl"
            style={{ backgroundImage: `url(${link.thumbnailUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/85 to-background" />
        </div>
      )}

      <div className="relative mx-auto max-w-lg px-6 pt-24 pb-20">
        {/* Track Card */}
        <div className="animate-slide-up overflow-hidden rounded-3xl border border-border/80 bg-card/80 shadow-pop backdrop-blur-xl">
          {/* Album art */}
          <div className="relative aspect-square w-full overflow-hidden bg-secondary">
            {link.thumbnailUrl ? (
              <img
                src={link.thumbnailUrl}
                alt={`${link.trackTitle ?? "Album"} cover`}
                width={800}
                height={800}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Music className="h-20 w-20 text-muted-foreground/25" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/90 to-transparent" />
          </div>

          <div className="p-6 pt-5">
            <h1 className="font-heading text-2xl font-bold leading-tight text-foreground">
              {link.trackTitle ?? "제목 미상"}
            </h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">
              {link.trackArtist ?? "아티스트 미상"}
            </p>
            {typeof link.clickCount === "number" && (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                <MousePointerClick className="h-3.5 w-3.5" />
                클릭 {link.clickCount.toLocaleString()}회
              </div>
            )}
          </div>
        </div>

        {/* Share Link */}
        <div
          className="mt-7 animate-slide-up"
          style={{ animationDelay: "0.08s" }}
        >
          <p className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground">
            공유 링크
          </p>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary py-2 pl-4 pr-2">
            <div className="flex-1 truncate font-mono text-sm text-foreground">
              {shareUrlDisplay}
            </div>
            {canShare && (
              <Button
                variant="hero"
                size="icon"
                onClick={handleShare}
                aria-label="공유"
                className="h-10 w-10 shrink-0 rounded-xl"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="hero"
              size="icon"
              onClick={handleCopy}
              aria-label={copied ? "복사됨" : "링크 복사"}
              className="h-10 w-10 shrink-0 rounded-xl"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Platform Links */}
        <div
          className="mt-8 animate-slide-up"
          style={{ animationDelay: "0.16s" }}
        >
          <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">
            플랫폼에서 듣기
          </p>
          {platforms.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center text-sm text-muted-foreground">
              연결된 플랫폼이 아직 없습니다.
            </p>
          ) : (
            <div className="space-y-2.5">
              {platforms.map((platform) => {
                const config = getPlatformConfig(platform.key);
                const label = config?.label ?? platform.rawName;
                return (
                  <a
                    key={`${platform.key}-${platform.url}`}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-card"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-background/40">
                      {config ? (
                        <PlatformIcon platform={platform.key} size={28} />
                      ) : (
                        <Music className="h-6 w-6 text-muted-foreground" />
                      )}
                    </span>
                    <span className="flex-1 font-medium text-foreground">
                      {label}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      듣기
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

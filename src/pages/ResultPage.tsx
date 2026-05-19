import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Copy, Check, ExternalLink, LoaderCircle, Music } from "lucide-react";
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
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-lg mx-auto rounded-2xl bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground">
            {error ?? "링크를 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        {/* Track Card */}
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden animate-slide-up">
          {/* Album art */}
          <div className="w-full aspect-square max-h-64 bg-secondary flex items-center justify-center overflow-hidden">
            {link.thumbnailUrl ? (
              <img
                src={link.thumbnailUrl}
                alt={`${link.trackTitle ?? "Album"} cover`}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-16 h-16 text-muted-foreground/40" />
            )}
          </div>

          <div className="p-6">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {link.trackTitle ?? "제목 미상"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {link.trackArtist ?? "아티스트 미상"}
            </p>
            {typeof link.clickCount === "number" && (
              <p className="text-xs text-muted-foreground mt-2">
                클릭 {link.clickCount.toLocaleString()}회
              </p>
            )}
          </div>
        </div>

        {/* Share Link */}
        <div
          className="mt-6 p-4 rounded-xl bg-secondary border border-border flex items-center gap-3 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex-1 font-mono text-sm text-foreground truncate">
            {shareUrlDisplay}
          </div>
          <Button
            variant="hero"
            size="icon"
            onClick={handleCopy}
            aria-label={copied ? "복사됨" : "링크 복사"}
            className="shrink-0 rounded-lg"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Platform Links */}
        <div
          className="mt-8 space-y-3 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="font-heading font-semibold text-foreground mb-4">
            플랫폼에서 듣기
          </h2>
          {platforms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              연결된 플랫폼이 아직 없습니다.
            </p>
          ) : (
            platforms.map((platform) => {
              const config = getPlatformConfig(platform.key);
              const label = config?.label ?? platform.rawName;
              return (
                <a
                  key={`${platform.key}-${platform.url}`}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:shadow-card group"
                >
                  {config ? (
                    <PlatformIcon platform={platform.key} size={32} />
                  ) : (
                    <Music className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className="flex-1 font-medium text-foreground">
                    {label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

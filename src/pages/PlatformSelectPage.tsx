import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  ExternalLink,
  LoaderCircle,
  Music,
  MousePointerClick,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import PlatformIcon, { getPlatformConfig } from "@/components/PlatformIcon";
import {
  ApiError,
  flattenPlatformEntries,
  linkApi,
  normalizePlatformKey,
  type LinkResponse,
} from "@/lib/api";

const PREFERRED_PLATFORM_KEY = "playona_preferred_platform";

type PlatformOption = {
  key: string;
  rawName: string;
  url: string;
};

const isValidHttpUrl = (url?: string | null) => {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const LoadingState = () => (
  <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm">링크 정보를 불러오는 중입니다...</p>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <AlertCircle className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

const PlatformSelectPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [link, setLink] = useState<LinkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [savePreference, setSavePreference] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!shortCode) {
      setError("잘못된 링크입니다.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setManualError(null);
    setLink(null);

    (async () => {
      try {
        const data = await linkApi.get(shortCode);
        if (cancelled) return;
        setLink(data);

        const preferred = localStorage.getItem(PREFERRED_PLATFORM_KEY);
        if (preferred) {
          const match = flattenPlatformEntries(data.platforms).find(
            (entry) =>
              normalizePlatformKey(entry.platform) === preferred &&
              isValidHttpUrl(entry.url),
          );
          if (match) {
            // /redirect 로 클릭수만 집계하고 실제 플랫폼 URL로 이동한다.
            linkApi.trackClick(shortCode);
            window.location.replace(match.url);
            return;
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "링크를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shortCode]);

  useEffect(() => {
    setImageFailed(false);
  }, [link?.thumbnailUrl]);

  const platforms = useMemo<PlatformOption[]>(() => {
    const seen = new Set<string>();

    return flattenPlatformEntries(link?.platforms)
      .map((entry) => ({
        key: normalizePlatformKey(entry.platform),
        rawName: entry.platform,
        url: entry.url,
      }))
      .filter((platform) => {
        if (!isValidHttpUrl(platform.url)) return false;
        const dedupeKey = `${platform.key}:${platform.url}`;
        if (seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      });
  }, [link?.platforms]);

  const handlePlatformClick = (platform: PlatformOption) => {
    if (!isValidHttpUrl(platform.url)) {
      setManualError("이 플랫폼 링크는 현재 열 수 없습니다.");
      return;
    }

    setManualError(null);
    if (savePreference) {
      localStorage.setItem(PREFERRED_PLATFORM_KEY, platform.key);
    }
    // /redirect 로 클릭수만 집계하고 실제 플랫폼 URL로 이동한다.
    if (shortCode) linkApi.trackClick(shortCode);
    window.location.href = platform.url;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !link) {
    return (
      <ErrorState message={error ?? "공유 링크를 찾을 수 없습니다."} />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {link.thumbnailUrl && !imageFailed && (
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
        <div className="animate-slide-up overflow-hidden rounded-3xl border border-border/80 bg-card/80 shadow-pop backdrop-blur-xl">
          <div className="relative aspect-square w-full overflow-hidden bg-secondary">
            {link.thumbnailUrl && !imageFailed ? (
              <img
                src={link.thumbnailUrl}
                alt={`${link.trackTitle ?? "음악"} 앨범 이미지`}
                width={800}
                height={800}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Music className="h-20 w-20 text-muted-foreground/25" />
                <span className="text-sm">앨범 이미지 없음</span>
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

        <div
          className="mt-8 animate-slide-up"
          style={{ animationDelay: "0.08s" }}
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
                  <button
                    key={`${platform.key}-${platform.url}`}
                    type="button"
                    onClick={() => handlePlatformClick(platform)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                      열기
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {manualError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {manualError}
            </p>
          )}

          <label
            htmlFor="save-pref"
            className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-secondary/70 p-4 transition-colors hover:bg-secondary"
          >
            <Checkbox
              id="save-pref"
              checked={savePreference}
              onCheckedChange={(checked) =>
                setSavePreference(checked === true)
              }
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                이 플랫폼을 기본으로 저장
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                다음부터 이 브라우저에서 바로 이동할게요.
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PlatformSelectPage;

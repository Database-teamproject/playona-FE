import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, LoaderCircle, Music, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PlatformIcon, { getPlatformConfig } from "@/components/PlatformIcon";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  flattenPlatformEntries,
  linkApi,
  normalizePlatformKey,
  userApi,
  type LinkResponse,
} from "@/lib/api";

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

const LoadingState = ({ message }: { message: string }) => (
  <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

const MessageState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
    <div className="w-full max-w-md rounded-2xl bg-card border border-border p-8 text-center shadow-card">
      <div className="w-12 h-12 rounded-xl bg-secondary border border-border mx-auto mb-5 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-muted-foreground" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground mt-3">{description}</p>
    </div>
  </div>
);

const SharedRedirectPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { isAuthenticated, isReady, loginWithProvider } = useAuth();
  const [link, setLink] = useState<LinkResponse | null>(null);
  const [platformEntries, setPlatformEntries] = useState<
    Array<{ platform: string; url: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!shortCode) {
      setError("공유 링크 주소가 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setManualError(null);
    setLink(null);
    setPlatformEntries([]);
    setIsAutoRedirecting(false);

    (async () => {
      try {
        const data = await linkApi.get(shortCode);
        if (cancelled) return;

        setLink(data);

        const embeddedPlatforms = flattenPlatformEntries(data.platforms);
        if (embeddedPlatforms.length > 0) {
          setPlatformEntries(embeddedPlatforms);
          return;
        }

        try {
          const platformUrls = await linkApi.getPlatformUrls(shortCode);
          if (!cancelled) {
            setPlatformEntries(flattenPlatformEntries(platformUrls));
          }
        } catch {
          if (!cancelled) setPlatformEntries([]);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "공유 링크가 만료되었거나 존재하지 않습니다.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shortCode]);

  const platforms = useMemo<PlatformOption[]>(
    () =>
      platformEntries
        .map((entry) => ({
          key: normalizePlatformKey(entry.platform),
          rawName: entry.platform,
          url: entry.url,
        }))
        .filter((platform) => isValidHttpUrl(platform.url)),
    [platformEntries],
  );

  useEffect(() => {
    if (!isReady || !isAuthenticated || !link || platforms.length === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const preferences = await userApi.myPlatforms();
        if (cancelled) return;

        const preferred = [...preferences].sort(
          (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
        )[0];
        if (!preferred?.platformName) return;

        const preferredKey = normalizePlatformKey(preferred.platformName);
        const selected = platforms.find(
          (platform) => platform.key === preferredKey,
        );
        if (!selected) return;

        setIsAutoRedirecting(true);
        window.setTimeout(() => {
          window.location.href = selected.url;
        }, 500);
      } catch {
        // 계정 선호 플랫폼 조회 실패 시 자동 이동하지 않고 수동 선택 UI를 유지한다.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, isAuthenticated, link, platforms]);

  useEffect(() => {
    setImageFailed(false);
  }, [link?.thumbnailUrl]);

  const handlePlatformClick = (platform: PlatformOption) => {
    if (!isValidHttpUrl(platform.url)) {
      setManualError("이 플랫폼 링크는 현재 열 수 없습니다.");
      return;
    }

    window.location.href = platform.url;
  };

  if (isLoading || !isReady) {
    return <LoadingState message="공유 링크를 확인하는 중입니다..." />;
  }

  if (error || !link) {
    return (
      <MessageState
        title="링크를 열 수 없습니다."
        description={error ?? "공유 링크가 만료되었거나 존재하지 않습니다."}
      />
    );
  }

  if (isAutoRedirecting) {
    return <LoadingState message="선호 플랫폼으로 이동 중입니다..." />;
  }

  if (platforms.length === 0) {
    return (
      <MessageState
        title="현재 열 수 있는 음악 플랫폼이 없습니다."
        description="잠시 후 다시 시도하거나 다른 공유 링크를 확인해 주세요."
      />
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <main className="w-full max-w-lg mx-auto animate-slide-up">
        <section className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="w-full aspect-square max-h-72 bg-secondary flex items-center justify-center overflow-hidden">
            {link.thumbnailUrl && !imageFailed ? (
              <img
                src={link.thumbnailUrl}
                alt={`${link.trackTitle ?? "곡"} 앨범 이미지`}
                className="w-full h-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Music className="w-12 h-12 text-muted-foreground/50" />
                <span className="text-sm">앨범 이미지 없음</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Playona Share
            </p>
            <h1 className="font-heading text-2xl font-bold text-foreground leading-tight">
              {link.trackTitle ?? "제목 미상"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {link.trackArtist ?? "아티스트 미상"}
            </p>
            {typeof link.clickCount === "number" && (
              <p className="text-xs text-muted-foreground mt-2">
                클릭 {link.clickCount.toLocaleString()}회
              </p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="relative mb-4">
            <h2 className="font-heading font-semibold text-foreground text-center">
              음악 플랫폼 선택
            </h2>

            {!isAuthenticated && (
              <p className="mt-2 text-center text-xs font-medium text-foreground sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
                <button
                  type="button"
                  onClick={() => loginWithProvider("kakao")}
                  className="cursor-pointer rounded-sm px-1 py-0.5 font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  로그인
                </button>
                하면 자동으로 이동돼요!
              </p>
            )}
          </div>

          <div className="w-full max-w-full overflow-x-auto pb-2">
            <div className="flex items-center justify-center gap-6 min-w-max px-1">
              {platforms.map((platform) => {
                const config = getPlatformConfig(platform.key);
                const label = config?.label ?? platform.rawName;

                return (
                  <Tooltip key={`${platform.key}-${platform.url}`}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handlePlatformClick(platform)}
                        aria-label={`${label}로 이동하기`}
                        className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200"
                      >
                        {config ? (
                          <PlatformIcon platform={platform.key} size={40} />
                        ) : (
                          <Music className="w-7 h-7 text-muted-foreground" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      {label}로 이동하기
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {manualError && (
            <p className="mt-3 text-sm text-destructive text-center" role="alert">
              {manualError}
            </p>
          )}
        </section>

        {isAuthenticated && (
          <section className="mt-8 rounded-xl bg-secondary border border-border p-5 flex items-start gap-4">
            <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-heading font-semibold text-foreground">
                선호 플랫폼으로 자동 이동하지 못했습니다.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                계정에 저장된 선호 플랫폼이 이 공유 링크에 없어서 직접 선택 화면을 보여드렸습니다.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SharedRedirectPage;

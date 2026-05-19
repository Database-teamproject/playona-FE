import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ExternalLink, LoaderCircle, Music } from "lucide-react";
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

const PlatformSelectPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [link, setLink] = useState<LinkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savePreference, setSavePreference] = useState(false);

  useEffect(() => {
    if (!shortCode) return;
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const data = await linkApi.get(shortCode);
        if (cancelled) return;
        setLink(data);

        // Auto-redirect if user has a preferred platform with a matching URL.
        const preferred = localStorage.getItem(PREFERRED_PLATFORM_KEY);
        if (preferred) {
          const entries = flattenPlatformEntries(data.platforms);
          const match = entries.find(
            (e) => normalizePlatformKey(e.platform) === preferred,
          );
          if (match?.url) {
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

  const platforms = useMemo(
    () =>
      flattenPlatformEntries(link?.platforms).map((entry) => ({
        key: normalizePlatformKey(entry.platform),
        rawName: entry.platform,
        url: entry.url,
      })),
    [link?.platforms],
  );

  const handlePlatformClick = (platformId: string, url: string) => {
    if (savePreference) {
      localStorage.setItem(PREFERRED_PLATFORM_KEY, platformId);
    }
    window.location.href = url;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-md mx-auto rounded-2xl bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground">
            {error ?? "링크를 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md animate-slide-up">
        {/* Track info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-secondary border border-border mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {link.thumbnailUrl ? (
              <img
                src={link.thumbnailUrl}
                alt={`${link.trackTitle ?? "track"} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-8 h-8 text-muted-foreground/40" />
            )}
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {link.trackTitle ?? "제목 미상"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {link.trackArtist ?? "아티스트 미상"}
          </p>
        </div>

        {/* Platform selection */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            어떤 플랫폼으로 들으시겠어요?
          </p>
          {platforms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              연결된 플랫폼이 없습니다.
            </p>
          ) : (
            platforms.map((platform) => {
              const config = getPlatformConfig(platform.key);
              const label = config?.label ?? platform.rawName;
              return (
                <button
                  key={`${platform.key}-${platform.url}`}
                  onClick={() => handlePlatformClick(platform.key, platform.url)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 hover:shadow-card group"
                >
                  {config ? (
                    <PlatformIcon platform={platform.key} size={32} />
                  ) : (
                    <Music className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-left font-medium text-foreground">
                    {label}에서 듣기
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Save preference */}
        <div className="mt-6 flex items-center gap-3 justify-center">
          <Checkbox
            id="save-pref"
            checked={savePreference}
            onCheckedChange={(checked) => setSavePreference(checked as boolean)}
          />
          <label
            htmlFor="save-pref"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            이 플랫폼을 기본으로 저장
          </label>
        </div>
      </div>
    </div>
  );
};

export default PlatformSelectPage;

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PlatformIcon, { getPlatformConfig } from "@/components/PlatformIcon";
import SocialLoginButton from "@/components/SocialLoginButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  normalizePlatformKey,
  platformApi,
  userApi,
  type PlatformInfo,
  type PlatformPreferenceResponse,
} from "@/lib/api";

type Row = {
  platformId: number;
  platformName: string;
  iconKey: string;
};

const PREFERRED_PLATFORM_KEY = "playona_preferred_platform";

const SettingsPage = () => {
  const { isAuthenticated, isReady, loginWithProvider } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [preferredId, setPreferredId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const [list, prefs] = await Promise.all([
          platformApi.list(),
          isAuthenticated
            ? userApi.myPlatforms()
            : Promise.resolve<PlatformPreferenceResponse[]>([]),
        ]);
        if (cancelled) return;

        const built: Row[] = (list as PlatformInfo[]).map((p) => ({
          platformId: p.platformId,
          platformName: p.platformName,
          iconKey: normalizePlatformKey(p.platformName),
        }));
        setRows(built);

        const topPref =
          [...prefs].sort(
            (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
          )[0] ?? null;
        setPreferredId(topPref?.platformId ?? null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "플랫폼 정보를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, isAuthenticated]);

  const preferredIconKey = useMemo(() => {
    const row = rows.find((r) => r.platformId === preferredId);
    return row?.iconKey ?? null;
  }, [rows, preferredId]);

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      const payload =
        preferredId === null
          ? []
          : [{ platformId: preferredId, priority: 1 }];
      await userApi.updatePlatforms(payload);

      if (preferredIconKey) {
        localStorage.setItem(PREFERRED_PLATFORM_KEY, preferredIconKey);
      } else {
        localStorage.removeItem(PREFERRED_PLATFORM_KEY);
      }
      toast.success("플랫폼 설정이 저장되었습니다!");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "플랫폼 설정 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-lg mx-auto rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-card">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            플랫폼 설정
          </h1>
          <p className="text-muted-foreground mb-8">
            기본 플랫폼을 저장하려면 로그인이 필요합니다.
          </p>
          <SocialLoginButton
            provider="kakao"
            onClick={() => loginWithProvider("kakao")}
            className="w-full rounded-xl h-12 text-sm font-semibold"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          플랫폼 설정
        </h1>
        <p className="text-muted-foreground mb-8">
          선호 플랫폼을 설정하면 공유 링크 클릭 시 자동으로 이동합니다.
        </p>

        {/* Preferred platform */}
        <div className="animate-slide-up">
          <h2 className="font-heading font-semibold text-foreground mb-4">
            기본 플랫폼
          </h2>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <LoaderCircle className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => {
                const isSelected = preferredId === row.platformId;
                const config = getPlatformConfig(row.iconKey);
                const label = config?.label ?? row.platformName;
                return (
                  <button
                    key={row.platformId}
                    onClick={() =>
                      setPreferredId(isSelected ? null : row.platformId)
                    }
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 border-primary/40"
                        : "bg-card border-border hover:bg-primary/5 hover:border-primary/25"
                    }`}
                    style={
                      isSelected
                        ? { boxShadow: "0 0 16px -4px hsl(var(--primary) / 0.4)" }
                        : {}
                    }
                  >
                    {config ? (
                      <PlatformIcon platform={row.iconKey} size={32} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary" />
                    )}
                    <span className="flex-1 text-left font-medium text-foreground">
                      {label}
                    </span>
                    {isSelected && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gradient-primary text-primary-foreground">
                        기본
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button
          variant="hero"
          className="w-full mt-8 rounded-xl"
          size="lg"
          onClick={handleSave}
          disabled={isSaving || isLoading}
        >
          저장하기
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialLoginButton from "@/components/SocialLoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { getProviderLabel, saveSession, userResponseToSession } from "@/lib/auth";
import { toast } from "sonner";
import { ApiError, userApi } from "@/lib/api";

const ProfilePage = () => {
  const { isAuthenticated, isReady, loginWithProvider, session, setSession } =
    useAuth();
  const [name, setName] = useState(session?.user.name ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    session?.user.profileImageUrl ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setProfileImageUrl(session.user.profileImageUrl ?? "");
    }
  }, [session?.user]);

  const handleSave = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const updated = await userApi.update({
        nickname: name.trim(),
        profileImageUrl: profileImageUrl.trim() || undefined,
      });
      const nextSession = userResponseToSession(
        updated,
        session.user.provider,
      );
      saveSession(nextSession);
      setSession(nextSession);
      toast.success("프로필이 저장되었습니다!");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "프로필 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <div className="w-24 h-10 rounded-full bg-secondary/70 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-lg mx-auto rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-card">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            프로필
          </h1>
          <p className="text-muted-foreground mb-8">
            프로필을 관리하려면 먼저 소셜 로그인이 필요합니다.
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
          프로필 편집
        </h1>
        <p className="text-muted-foreground mb-8">
          이름과 프로필 이미지를 변경할 수 있어요.
        </p>

        <div className="animate-slide-up">
          <div className="flex items-center gap-4 mb-8">
            {session?.user.profileImageUrl ? (
              <img
                src={session.user.profileImageUrl}
                alt={session.user.name}
                className="w-16 h-16 rounded-full object-cover shadow-glow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
                <UserRound className="w-7 h-7" strokeWidth={2.2} />
              </div>
            )}
            <div>
              <p className="font-heading font-semibold text-foreground">
                {name || "이름 없음"}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.user.email ||
                  `${getProviderLabel(session?.user.provider || "kakao")} 계정`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="profile-name"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                이름
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="표시할 이름"
                className="rounded-xl bg-secondary border-border"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="profile-image"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                프로필 이미지 URL
              </label>
              <Input
                id="profile-image"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://…"
                className="rounded-xl bg-secondary border-border"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="profile-email"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                이메일
              </label>
              <Input
                id="profile-email"
                type="email"
                value={session?.user.email || ""}
                readOnly
                aria-readonly="true"
                className="rounded-xl bg-secondary/50 border-border text-muted-foreground cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Button
              variant="hero"
              size="lg"
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="w-full mt-3 rounded-xl"
            >
              {isSaving ? "저장 중…" : "저장하기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

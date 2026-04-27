import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PROFILE_EMAIL = "user@playona.io";

const ProfilePage = () => {
  const [name, setName] = useState(
    () => localStorage.getItem("playona_profile_name") || "게스트",
  );

  const handleSave = () => {
    localStorage.setItem("playona_profile_name", name);
    toast.success("프로필이 저장되었습니다!");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          프로필 편집
        </h1>
        <p className="text-muted-foreground mb-8">
          이름은 자유롭게 바꿀 수 있어요.
        </p>

        <div className="animate-slide-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <UserRound className="w-7 h-7" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">
                {name || "이름 없음"}
              </p>
              <p className="text-xs text-muted-foreground">{PROFILE_EMAIL}</p>
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
                htmlFor="profile-email"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                이메일
              </label>
              <Input
                id="profile-email"
                type="email"
                value={PROFILE_EMAIL}
                readOnly
                aria-readonly="true"
                className="rounded-xl bg-secondary/50 border-border text-muted-foreground cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Button
              variant="hero"
              size="lg"
              onClick={handleSave}
              className="w-full mt-3 rounded-xl"
            >
              저장하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

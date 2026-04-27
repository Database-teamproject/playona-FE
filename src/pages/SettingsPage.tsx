import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PlatformIcon from "@/components/PlatformIcon";

const ALL_PLATFORMS = [
  { id: "spotify", name: "Spotify" },
  { id: "ytmusic", name: "YouTube Music" },
  { id: "apple", name: "Apple Music" },
  { id: "melon", name: "Melon" },
];

const SettingsPage = () => {
  const [preferred, setPreferred] = useState<string>(
    () => localStorage.getItem("playona_preferred_platform") || "",
  );

  const handleSave = () => {
    if (preferred) {
      localStorage.setItem("playona_preferred_platform", preferred);
    } else {
      localStorage.removeItem("playona_preferred_platform");
    }
    toast.success("설정이 저장되었습니다!");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          설정
        </h1>
        <p className="text-muted-foreground mb-8">
          선호 플랫폼을 설정하면 공유 링크 클릭 시 자동으로 이동합니다.
        </p>

        {/* Preferred platform */}
        <div className="animate-slide-up">
          <h2 className="font-heading font-semibold text-foreground mb-4">
            기본 플랫폼
          </h2>
          <div className="space-y-2">
            {ALL_PLATFORMS.map((platform) => {
              const isSelected = preferred === platform.id;
              return (
                <button
                  key={platform.id}
                  onClick={() => setPreferred(isSelected ? "" : platform.id)}
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
                  <PlatformIcon platform={platform.id} size={32} />
                  <span className="flex-1 text-left font-medium text-foreground">
                    {platform.name}
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
        </div>

        <Button
          variant="hero"
          className="w-full mt-8 rounded-xl"
          size="lg"
          onClick={handleSave}
        >
          저장하기
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;

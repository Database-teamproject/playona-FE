import { useParams } from "react-router-dom";
import { ExternalLink, Music } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import PlatformIcon, { getPlatformConfig } from "@/components/PlatformIcon";

const PLATFORMS = [
  { id: "spotify", url: "https://open.spotify.com/track/example" },
  { id: "ytmusic", url: "https://music.youtube.com/watch?v=example" },
  { id: "apple", url: "https://music.apple.com/track/example" },
  { id: "melon", url: "https://www.melon.com/song/detail.htm?songId=example" },
  { id: "youtube", url: "https://www.youtube.com/watch?v=example" },
];

const MOCK_TRACK = {
  title: "Dynamite",
  artist: "BTS",
};

const PlatformSelectPage = () => {
  const { shortCode } = useParams();
  const [savePreference, setSavePreference] = useState(false);

  const handlePlatformClick = (platformId: string, url: string) => {
    if (savePreference) {
      localStorage.setItem("tunify_preferred_platform", platformId);
    }
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md animate-slide-up">
        {/* Track info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-secondary border border-border mx-auto mb-4 flex items-center justify-center">
            <Music className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {MOCK_TRACK.title}
          </h1>
          <p className="text-muted-foreground mt-1">{MOCK_TRACK.artist}</p>
        </div>

        {/* Platform selection */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            어떤 플랫폼으로 들으시겠어요?
          </p>
          {PLATFORMS.map((platform) => {
            const config = getPlatformConfig(platform.id);
            if (!config) return null;
            return (
              <button
                key={platform.id}
                onClick={() => handlePlatformClick(platform.id, platform.url)}
                style={
                  {
                    "--platform-border": config.borderColor,
                  } as React.CSSProperties
                }
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-[--platform-border] transition-all duration-200 hover:shadow-card group"
              >
                <PlatformIcon platform={platform.id} size={32} />
                <span className="flex-1 text-left font-medium text-foreground">
                  {config.label}에서 듣기
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            );
          })}
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

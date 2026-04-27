import { useLocation, useParams, Link } from "react-router-dom";
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  ArrowLeft,
  Music,
} from "lucide-react";
import heroMusic from "@/assets/hero-music.jpg";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import PlatformIcon, { getPlatformConfig } from "@/components/PlatformIcon";

const MOCK_TRACK = {
  title: "Dynamite",
  artist: "BTS",
  album: "Dynamite (DayTime Version)",
  duration: "3:19",
  albumArt: "",
};

const PLATFORMS = [
  {
    id: "spotify",
    url: "https://open.spotify.com/track/example",
  },
  {
    id: "ytmusic",
    url: "https://music.youtube.com/watch?v=example",
  },
  {
    id: "apple",
    url: "https://music.apple.com/track/example",
  },
  {
    id: "melon",
    url: "https://www.melon.com/song/detail.htm?songId=example",
  },
  {
    id: "youtube",
    url: "https://www.youtube.com/watch?v=example",
  },
];

const ResultPage = () => {
  const { shortCode } = useParams();
  const [copied, setCopied] = useState(false);
  const shareUrl = `tunify.io/t/${shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${shareUrl}`);
    setCopied(true);
    toast.success("링크가 복사되었습니다!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />새 링크 변환
        </Link>

        {/* Track Card */}
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden animate-slide-up">
          {/* Album art */}
          <div className="w-full aspect-square max-h-64 bg-secondary flex items-center justify-center overflow-hidden">
            <img
              src={heroMusic}
              alt="Album art"
              width={800}
              height={800}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {MOCK_TRACK.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {MOCK_TRACK.artist} · {MOCK_TRACK.album}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {MOCK_TRACK.duration}
            </p>
          </div>
        </div>

        {/* Share Link */}
        <div
          className="mt-6 p-4 rounded-xl bg-secondary border border-border flex items-center gap-3 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex-1 font-mono text-sm text-foreground truncate">
            {shareUrl}
          </div>
          <Button
            variant="hero"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "복사됨" : "복사"}
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
          {PLATFORMS.map((platform) => {
            const config = getPlatformConfig(platform.id);
            if (!config) return null;
            return (
              <a
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:shadow-card group"
                style={
                  {
                    "--hover-border": config.borderColor,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    config.borderColor;
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    config.bgColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                }}
              >
                <PlatformIcon platform={platform.id} size={32} />
                <span className="flex-1 font-medium text-foreground">
                  {config.label}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

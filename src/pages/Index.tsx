import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Disc3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PlatformIcon from "@/components/PlatformIcon";
import HelpButton from "@/components/HelpButton";
import Footer from "@/components/Footer";
import { linkApi, ApiError } from "@/lib/api";

const SUPPORTED_PLATFORMS = [
  { id: "spotify", name: "Spotify" },
  { id: "ytmusic", name: "YouTube Music" },
  { id: "apple", name: "Apple Music" },
  { id: "melon", name: "Melon" },
];

const Index = () => {
  const [linkInput, setLinkInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleConvert = async () => {
    const url = linkInput.trim();
    if (!url || isProcessing) return;
    setIsProcessing(true);
    try {
      const link = await linkApi.create(url);
      if (!link?.shortCode) {
        throw new Error("응답에 shortCode가 없습니다.");
      }
      navigate(`/result/${link.shortCode}`, {
        state: { originalLink: url, link },
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "링크 변환에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow pointer-events-none" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse-glow pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center animate-slide-up">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            음악을 공유하는
            <br />
            <span className="text-gradient">가장 쉬운 방법</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10">
            모든 플랫폼에서 열리는 하나의 링크로 변환하세요.
          </p>

          {/* Link Input */}
          <div className="w-full max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="URL"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConvert()}
                  className="h-[52px] pl-4 pr-4 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-base rounded-xl"
                />
              </div>
              <Button
                variant="hero"
                onClick={handleConvert}
                disabled={!linkInput.trim() || isProcessing}
                aria-label="변환"
                className="rounded-xl h-[52px] w-[88px] shrink-0 p-0"
              >
                {isProcessing ? (
                  <Disc3 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Supported platforms */}
        <div
          className="relative z-10 mt-16 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-widest">
            지원 플랫폼
          </p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {SUPPORTED_PLATFORMS.map((p) => (
              <Tooltip key={p.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={p.name}
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center justify-center w-12 h-12 rounded-xl opacity-80 transition-all cursor-default"
                  >
                    <PlatformIcon platform={p.id} size={40} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{p.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <HelpButton />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

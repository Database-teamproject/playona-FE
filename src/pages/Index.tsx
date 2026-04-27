import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, ArrowRight, Music2, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PlatformIcon from "@/components/PlatformIcon";

const SUPPORTED_PLATFORMS = [
  { id: "spotify", name: "Spotify" },
  { id: "ytmusic", name: "YouTube Music" },
  { id: "apple", name: "Apple Music" },
  { id: "melon", name: "Melon" },
  { id: "youtube", name: "YouTube" },
];

const Index = () => {
  const [linkInput, setLinkInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleConvert = () => {
    if (!linkInput.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/result/demo123", { state: { originalLink: linkInput } });
    }, 1500);
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

        {/* Floating music icons */}
        <div className="absolute top-32 left-[15%] text-muted-foreground/20 animate-float">
          <Music2 className="w-8 h-8" />
        </div>
        <div
          className="absolute top-48 right-[20%] text-muted-foreground/20 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <Disc3 className="w-10 h-10" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-sm text-muted-foreground mb-8">
            <Link2 className="w-3.5 h-3.5" />
            어떤 플랫폼이든 하나의 링크로
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            음악을 공유하는
            <br />
            <span className="text-gradient">가장 쉬운 방법</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10">
            Spotify, YouTube Music, Melon, Apple Music —
            <br className="hidden sm:block" />
            어떤 링크든 모든 플랫폼에서 열리는 하나의 링크로 변환하세요.
          </p>

          {/* Link Input */}
          <div className="w-full max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="음악 링크를 붙여넣으세요..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConvert()}
                  className="h-13 pl-4 pr-4 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-base rounded-xl"
                />
              </div>
              <Button
                variant="hero"
                size="lg"
                onClick={handleConvert}
                disabled={!linkInput.trim() || isProcessing}
                className="rounded-xl h-13 px-6"
              >
                {isProcessing ? (
                  <Disc3 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    변환
                    <ArrowRight className="w-4 h-4" />
                  </>
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
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {SUPPORTED_PLATFORMS.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-secondary/60 border border-border text-sm text-secondary-foreground hover:border-border/80 transition-colors"
              >
                <PlatformIcon platform={p.id} size={18} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center mb-12">
            어떻게 <span className="text-gradient">작동</span>하나요?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "링크 붙여넣기",
                desc: "Spotify, YouTube Music 등 아무 음악 링크를 입력하세요.",
              },
              {
                step: "02",
                title: "자동 매칭",
                desc: "AI가 모든 플랫폼에서 같은 곡을 찾아 매칭합니다.",
              },
              {
                step: "03",
                title: "공유하기",
                desc: "생성된 Tunify 링크를 공유하면 누구나 자기 플랫폼으로 들을 수 있어요.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-card border border-border shadow-card group hover:border-primary/30 transition-colors"
              >
                <span className="text-gradient font-heading font-bold text-3xl">
                  {item.step}
                </span>
                <h3 className="font-heading font-semibold text-lg mt-4 mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform logos strip */}
      <section className="px-6 py-12 border-t border-border bg-card/40">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            연결된 스트리밍 서비스
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {SUPPORTED_PLATFORMS.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <PlatformIcon platform={p.id} size={36} />
                <span className="text-xs text-muted-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

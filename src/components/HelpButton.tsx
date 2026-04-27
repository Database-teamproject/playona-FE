import { useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "링크 붙여넣기",
    desc: "Spotify, YouTube Music 등 아무 음악 링크를 입력하세요.",
  },
  {
    step: "02",
    title: "자동 매칭",
    desc: "모든 플랫폼에서 같은 곡을 찾아 자동으로 매칭해드려요.",
  },
  {
    step: "03",
    title: "공유하기",
    desc: "생성된 Playona 링크를 공유하면 누구나 자기 플랫폼으로 들을 수 있어요.",
  },
];

const HelpButton = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="어떻게 동작하나요?"
        aria-expanded={open}
        className="w-9 h-9 rounded-full border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-border/80 flex items-center justify-center transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Playona 사용 방법"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-[320px] max-w-[calc(100vw-3rem)] rounded-2xl bg-surface-elevated border border-border p-5 z-30 animate-popover-in text-left"
          style={{ boxShadow: "var(--shadow-pop)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-base text-foreground">
              어떻게 <span className="text-gradient">동작</span>하나요?
            </h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="닫기"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li key={s.step} className="flex gap-3">
                <span className="text-gradient font-heading font-bold text-lg leading-none shrink-0 w-7">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default HelpButton;

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

// 모달은 포털로 body에 렌더링되므로 부모 섹션의 overflow-hidden 에 잘리지 않는다.
const HelpButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="어떻게 동작하나요?"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">
            어떻게 <span className="text-gradient">동작</span>하나요?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Playona 사용 방법 3단계 안내
          </DialogDescription>
        </DialogHeader>
        <ol className="mt-2 space-y-4">
          {STEPS.map((s) => (
            <li key={s.step} className="flex gap-3">
              <span className="w-7 shrink-0 font-heading text-lg font-bold leading-none text-gradient">
                {s.step}
              </span>
              <div>
                <h3 className="mb-1 font-heading text-sm font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
};

export default HelpButton;

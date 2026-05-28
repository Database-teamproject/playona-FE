import { useState } from "react";
import { MessageCircleQuestion, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const FEEDBACK_EMAIL =
  import.meta.env.VITE_FEEDBACK_EMAIL?.trim() || "jaeuu.dev@gmail.com";

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const body = message.trim();
    if (!body) {
      toast.error("피드백 내용을 입력해주세요.");
      return;
    }
    const subject = encodeURIComponent("[Playona] 문의 드립니다");
    const mailBody = encodeURIComponent(body);
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${mailBody}`;
    toast.success("소중한 의견 감사합니다!");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="피드백 남기기"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)/0.7),hsl(var(--accent)/0.7))] text-primary-foreground shadow-glow backdrop-blur-md transition-all hover:bg-[linear-gradient(135deg,hsl(var(--primary)/0.85),hsl(var(--accent)/0.85))] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MessageCircleQuestion className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            <span className="text-gradient">피드백</span>을 남겨주세요
          </DialogTitle>
          <DialogDescription>
            서비스 개선에 큰 도움이 됩니다. 불편한 점이나 제안을 자유롭게
            알려주세요.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="어떤 점이 불편하셨나요? 또는 어떤 기능이 있으면 좋을까요?"
          rows={5}
          className="resize-none"
        />
        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;

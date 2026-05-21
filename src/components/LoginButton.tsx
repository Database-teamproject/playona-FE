import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SocialLoginButton from "@/components/SocialLoginButton";
import { useAuth } from "@/contexts/AuthContext";

type LoginButtonProps = {
  /** 기본 트리거 버튼에 적용할 클래스. children을 넘기면 무시된다. */
  className?: string;
  /** 기본 트리거 버튼의 라벨. */
  label?: string;
  /** 직접 만든 트리거 요소. 넘기면 기본 버튼 대신 사용한다. */
  children?: ReactNode;
};

/**
 * "로그인" 버튼 — 누르면 카카오·구글 중 선택하는 다이얼로그를 연다.
 */
const LoginButton = ({ className, label = "로그인", children }: LoginButtonProps) => {
  const { loginWithProvider } = useAuth();
  const [open, setOpen] = useState(false);

  const start = (provider: "kakao" | "google") => {
    setOpen(false);
    loginWithProvider(provider);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="hero" className={className}>
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">로그인</DialogTitle>
          <DialogDescription className="text-center">
            소셜 계정으로 간편하게 시작하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-3">
          <SocialLoginButton
            provider="kakao"
            onClick={() => start("kakao")}
            className="h-12 w-full rounded-xl text-sm font-semibold"
          />
          <SocialLoginButton
            provider="google"
            onClick={() => start("google")}
            className="h-12 w-full rounded-xl border border-border text-sm font-semibold"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginButton;

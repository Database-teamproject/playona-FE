import { useEffect, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginButton from "@/components/LoginButton";
import { Button } from "@/components/ui/button";

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshSession, isReady } = useAuth();
  const [error, setError] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).has("error")
      ? "카카오 인증을 완료하지 못했습니다. 다시 로그인해주세요."
      : null,
  );

  useEffect(() => {
    if (!isReady || error) return;

    let cancelled = false;
    (async () => {
      const session = await refreshSession();
      if (cancelled) return;
      if (session) {
        navigate("/", { replace: true });
      } else {
        setError("로그인 정보를 확인할 수 없습니다. 다시 시도해주세요.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, refreshSession, navigate, error]);

  return (
    <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 text-center shadow-card">
        {error ? (
          <CircleAlert className="w-10 h-10 mx-auto mb-4 text-destructive" />
        ) : (
          <LoaderCircle className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
        )}
        <p className="t-h2 text-foreground mb-3">{error ? "로그인 실패" : "로그인 처리 중"}</p>
        <p className="text-sm text-muted-foreground">
          {error ?? "인증을 확인하고 있습니다. 잠시만 기다려주세요."}
        </p>
        {error && (
          <div className="mt-6 flex justify-center gap-3">
            <LoginButton label="다시 로그인" />
            <Button variant="outline" onClick={() => navigate("/", { replace: true })}>
              홈으로
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSuccessPage;

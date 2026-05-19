import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshSession, isReady } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

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
  }, [isReady, refreshSession, navigate]);

  return (
    <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 text-center shadow-card">
        <LoaderCircle className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
        <p className="t-h2 text-foreground mb-3">로그인 처리 중</p>
        <p className="text-sm text-muted-foreground">
          {error ?? "인증을 확인하고 있습니다. 잠시만 기다려주세요."}
        </p>
      </div>
    </div>
  );
};

export default AuthSuccessPage;

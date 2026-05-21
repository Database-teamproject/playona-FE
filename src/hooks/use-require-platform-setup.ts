import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";

/**
 * 로그인했지만 플랫폼 설정을 하지 않은 회원을 설정(플랫폼 선택) 페이지로 보낸다.
 *
 * 별도 백엔드 플래그 없이, GET /api/users/me/platforms 응답이 빈 배열인지로
 * "플랫폼 미설정" 상태를 판별한다. 가드를 걸 페이지에서 이 훅을 호출하면 된다.
 */
export const useRequirePlatformSetup = () => {
  const { isReady, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!isReady || !isAuthenticated || checkedRef.current) return;
    checkedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const preferences = await userApi.myPlatforms();
        if (cancelled) return;
        if (preferences.length === 0) {
          navigate("/settings", { replace: true });
        }
      } catch {
        // 조회 실패 시에는 리다이렉트하지 않는다 (정상 흐름을 막지 않기 위해).
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, isAuthenticated, navigate]);
};

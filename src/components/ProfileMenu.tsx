import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, LogOut, Settings, UserRound } from "lucide-react";
import LoginButton from "@/components/LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { getProviderLabel } from "@/lib/auth";

const ProfileMenu = () => {
  const { isAuthenticated, isReady, logout, session } = useAuth();
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

  const itemClass =
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors";

  if (!isReady) {
    return (
      <div className="w-24 h-10 rounded-full bg-secondary/70 animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginButton className="rounded-full px-4 h-10 text-sm font-semibold" />
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="내 프로필 메뉴"
        aria-expanded={open}
        className="w-9 h-9 rounded-full overflow-hidden shadow-glow hover:scale-105 active:scale-95 transition-transform"
        title={session?.user.name}
      >
        {session?.user.profileImageUrl ? (
          <img
            src={session.user.profileImageUrl}
            alt={session.user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex w-full h-full items-center justify-center bg-gradient-primary text-primary-foreground">
            <UserRound className="w-4 h-4" strokeWidth={2.2} />
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-surface-elevated border border-border p-1.5 z-50 animate-slide-up"
          style={{ boxShadow: "var(--shadow-pop)" }}
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {session?.user.name}
            </p>
            <p
              className="truncate text-xs text-muted-foreground"
              title={session?.user.email || undefined}
            >
              {session?.user.email ||
                `${getProviderLabel(session?.user.provider || "kakao")} 계정으로 로그인됨`}
            </p>
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <UserRound className="w-4 h-4 text-muted-foreground" />
            프로필 편집
          </Link>
          <Link
            to="/history"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <Clock className="w-4 h-4 text-muted-foreground" />
            히스토리
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            플랫폼 설정
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className={itemClass}
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

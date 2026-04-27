import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Settings, UserRound } from "lucide-react";

const ProfileMenu = () => {
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

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="내 프로필 메뉴"
        aria-expanded={open}
        className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-transform"
      >
        <UserRound className="w-4 h-4" strokeWidth={2.2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-surface-elevated border border-border p-1.5 z-50 animate-slide-up"
          style={{ boxShadow: "var(--shadow-pop)" }}
        >
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
            설정
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

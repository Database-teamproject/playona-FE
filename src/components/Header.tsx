import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const TunifyLogo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="logoGrad"
        x1="0"
        y1="0"
        x2="28"
        y2="28"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
    <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
    {/* Music note */}
    <path
      d="M18 8v8.5A2.5 2.5 0 1 1 15.5 14V10.5l-6 1.2V18a2.5 2.5 0 1 1-2.5-2.5c.3 0 .58.05.85.13V9l9.15-1.83V8z"
      fill="white"
    />
  </svg>
);

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-glass border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <TunifyLogo />
          <span
            className="font-heading font-bold text-xl"
            style={{
              background: "linear-gradient(135deg, #2DD4BF, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Tunify
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/60"
          >
            홈
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/60"
          >
            <Settings className="w-3.5 h-3.5" />
            설정
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

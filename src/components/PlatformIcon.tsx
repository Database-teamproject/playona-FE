import React from "react";

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

/* ── Official SVG paths from Simple Icons (simpleicons.org) ── */

const SpotifyIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#1ED760" />
    <path
      fill="#000"
      d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
    />
  </svg>
);

const YouTubeMusicIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Official YouTube Music path from simpleicons */}
    <path
      fill="#FF0000"
      d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"
    />
  </svg>
);

const AppleMusicIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Official Apple Music path from simpleicons */}
    <path
      fill="#FA243C"
      d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922.002-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z"
    />
  </svg>
);

/**
 * Melon — Korean streaming service.
 * Not available on Simple Icons; hand-crafted to faithfully represent the
 * official wordmark shape: green circle background + the stylised "M" note
 * that Melon uses in its app icon.
 */
const MelonIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Green circle background — Melon brand colour #00CD3C */}
    <circle cx="12" cy="12" r="12" fill="#00CD3C" />
    {/*
      Melon app icon: a white music-note "M" shape.
      Two note-heads sit at the bottom; stems rise and connect via a beam
      at the top — mirroring the actual Melon app icon geometry.
    */}
    {/* Left stem */}
    <rect x="6.5" y="7" width="2" height="8.5" rx="1" fill="white" />
    {/* Right stem */}
    <rect x="15.5" y="7" width="2" height="8.5" rx="1" fill="white" />
    {/* Middle stem (inner V-peak of the M) */}
    <rect x="11" y="9.5" width="2" height="6" rx="1" fill="white" />
    {/* Top beam connecting left to middle */}
    <rect x="6.5" y="7" width="6.5" height="2" rx="1" fill="white" />
    {/* Top beam connecting middle to right */}
    <rect x="11" y="7" width="6.5" height="2" rx="1" fill="white" />
    {/* Left note-head */}
    <ellipse cx="7.5" cy="15.8" rx="2.2" ry="1.5" fill="white" />
    {/* Right note-head */}
    <ellipse cx="16.5" cy="15.8" rx="2.2" ry="1.5" fill="white" />
  </svg>
);

const YouTubeIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Official YouTube path from simpleicons */}
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
    />
    <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/* ── Platform config map ── */

const PLATFORM_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    Icon: React.FC<{ size: number }>;
  }
> = {
  spotify: {
    label: "Spotify",
    color: "#1ED760",
    bgColor: "rgba(30,215,96,0.08)",
    borderColor: "rgba(30,215,96,0.35)",
    Icon: SpotifyIcon,
  },
  ytmusic: {
    label: "YouTube Music",
    color: "#FF0000",
    bgColor: "rgba(255,0,0,0.08)",
    borderColor: "rgba(255,0,0,0.3)",
    Icon: YouTubeMusicIcon,
  },
  apple: {
    label: "Apple Music",
    color: "#FA243C",
    bgColor: "rgba(250,36,60,0.08)",
    borderColor: "rgba(250,36,60,0.3)",
    Icon: AppleMusicIcon,
  },
  melon: {
    label: "Melon",
    color: "#00CD3C",
    bgColor: "rgba(0,205,60,0.08)",
    borderColor: "rgba(0,205,60,0.3)",
    Icon: MelonIcon,
  },
  youtube: {
    label: "YouTube",
    color: "#FF0000",
    bgColor: "rgba(255,0,0,0.08)",
    borderColor: "rgba(255,0,0,0.3)",
    Icon: YouTubeIcon,
  },
};

export const getPlatformConfig = (id: string) => PLATFORM_CONFIG[id] ?? null;

const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  size = 32,
  className,
}) => {
  const config = PLATFORM_CONFIG[platform];
  if (!config) return null;
  const { Icon } = config;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={size} />
    </span>
  );
};

export default PlatformIcon;

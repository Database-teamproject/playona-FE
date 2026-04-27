import React from "react";

const YoutubeMusicIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="12" fill="#FF0000" />
    <circle cx="12" cy="12" r="4.8" fill="white" />
    <circle cx="12" cy="12" r="2" fill="#FF0000" />
    <path
      d="M9.5 7.5C9.5 7.5 16 10.5 16 12C16 13.5 9.5 16.5 9.5 16.5V7.5Z"
      fill="white"
    />
  </svg>
);

export default YoutubeMusicIcon;

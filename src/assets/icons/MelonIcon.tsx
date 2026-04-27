import React from "react";

const MelonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
  >
    {/* Melon green background circle */}
    <circle cx="12" cy="12" r="12" fill="#00CD3C" />
    {/* Melon 'M' stylized note mark */}
    <path
      d="M6 16V9.5l3.5 4 3.5-4V16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M15.5 9.5h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2v2.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default MelonIcon;

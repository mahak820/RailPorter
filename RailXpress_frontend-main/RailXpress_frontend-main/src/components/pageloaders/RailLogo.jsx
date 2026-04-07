// frontend/src/components/RailLogo.jsx
import React from "react";
import "./RailLogo.css";

/**
 * RailLogo
 * Props:
 *  - size (number|string) : width in px or any CSS unit (default 160)
 *  - primary (string)     : primary color (default '#0b67ff')
 *  - accent (string)      : accent color (default '#7b39ff')
 *  - animate (bool)       : whether to run animations (default true)
 *
 * Usage:
 *  <RailLogo size={200} primary="#06b6d4" accent="#10b981" animate />
 */
export default function RailLogo({
  size = 160,
  primary = "#0b67ff",
  accent = "#7b39ff",
  animate = true,
}) {
  const style = {
    width: typeof size === "number" ? `${size}px` : size,
    ["--rx-primary"]: primary,
    ["--rx-accent"]: accent,
    ["--rx-animate"]: animate ? 1 : 0,
  };

  return (
    <div className="rx-logo-root" style={style} aria-hidden={!animate}>
      <svg
        viewBox="0 0 120 64"
        className={`rx-train-svg ${animate ? "rx-animate" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="RailPorter logo"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="var(--rx-primary)" stopOpacity="1" />
            <stop offset="1" stopColor="var(--rx-accent)" stopOpacity="1" />
          </linearGradient>

          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Rails */}
        <g className="rx-rails" transform="translate(0,50)">
          <rect x="4" y="6" width="112" height="4" rx="2" fill="#0b1720" opacity="0.6" />
          <rect x="0" y="0" width="120" height="2" rx="1" fill="#07121a" opacity="0.72" />
          {/* sleepers */}
          <g className="rx-sleepers" fill="#0b1b25" opacity="0.7">
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={6 + i * 14} y="2" width="6" height="8" rx="1" />
            ))}
          </g>
        </g>

        {/* Motion streaks (behind) */}
        <g className="rx-streaks" transform="translate(0,0)" opacity="0.85">
          <rect className="streak s1" x="-40" y="18" width="38" height="6" rx="3" fill="url(#g1)" opacity="0.16" />
          <rect className="streak s2" x="-60" y="28" width="50" height="6" rx="3" fill="url(#g1)" opacity="0.12" />
        </g>

        {/* Train body */}
        <g className="rx-train" filter="url(#shadow)">
          {/* cabin */}
          <rect x="8" y="12" width="86" height="28" rx="6" fill="#fff" />
          <rect x="16" y="4" width="54" height="20" rx="5" fill="url(#g1)" />

          {/* small detail blocks */}
          <rect x="76" y="22" width="12" height="8" rx="2" fill="#9aa8b7" />
          <rect x="92" y="22" width="8" height="8" rx="2" fill="#c9d2d8" />

          {/* windows */}
          <g fill="#e6f6ff" opacity="0.95">
            <rect x="20" y="8" width="16" height="8" rx="1" />
            <rect x="40" y="8" width="16" height="8" rx="1" />
            <rect x="60" y="8" width="10" height="8" rx="1" />
          </g>

          {/* wheels group */}
          <g className="rx-wheels" transform="translate(6,0)">
            <g className="wheel w1" transform="translate(28,44)">
              <circle r="6" fill="#0b67ff" />
              <circle r="3.2" fill="#07121a" />
            </g>
            <g className="wheel w2" transform="translate(68,44)">
              <circle r="6" fill="#0b67ff" />
              <circle r="3.2" fill="#07121a" />
            </g>
          </g>
        </g>

        {/* small brand text */}
        <g className="rx-text" transform="translate(6,60)">
          <text x="0" y="0" fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto" fontSize="8" fill="#dff4ff" fontWeight="700">
            Rail<span style={{ fill: "#fff" }}>Porter</span>
          </text>
        </g>
      </svg>
    </div>
  );
}

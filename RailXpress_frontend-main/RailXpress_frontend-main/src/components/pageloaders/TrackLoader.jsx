import React, { useEffect, useState } from "react";
import "./TrackLoader.css";

/**
 * TrackLoader
 * Props:
 *  - showFor (number ms) : how long loader remains visible (default 1600)
 *  - message (string)    : optional text below animation
 *
 * Usage:
 *  <TrackLoader showFor={1600} message="Starting RailXpress..." />
 */
export default function TrackLoader({ showFor = 1600, message = "Starting RailXpress..." }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), Math.max(600, showFor));
    return () => clearTimeout(t);
  }, [showFor]);

  if (!visible) return null;

  return (
    <div className="tl-backdrop" role="status" aria-live="polite">
      <div className="tl-container">
        <div className="tl-track-wrap">
          <div className="tl-track">
            {/* repeating sleepers / rails are CSS background; train moves via transform */}
            <div className="tl-train" aria-hidden="true">
              {/* SVG train for crisp visuals; you can replace with an image */}
              <svg viewBox="0 0 120 60" className="tl-train-svg" aria-hidden="true">
                <g>
                  <rect x="6" y="14" width="92" height="28" rx="6" fill="#f8fafc" />
                  <rect x="16" y="4" width="62" height="18" rx="6" fill="#0f172a" />
                  <circle cx="28" cy="46" r="6" fill="#0b67ff" />
                  <circle cx="68" cy="46" r="6" fill="#0b67ff" />
                  <rect x="86" y="26" width="18" height="12" rx="3" fill="#94a3b8" />
                </g>
              </svg>
            </div>
          </div>

          {/* decorative parallax layers */}
          <div className="tl-foreground-rails" />
        </div>

        <div className="tl-message">{message}</div>
      </div>
    </div>
  );
}

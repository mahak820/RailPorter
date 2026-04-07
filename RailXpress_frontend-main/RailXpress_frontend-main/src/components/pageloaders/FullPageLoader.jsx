// frontend/src/components/FullPageLoader.jsx
import React, { useEffect, useState } from "react";
import "./FullPageLoader.css";

/**
 * FullPageLoader
 *
 * Props:
 *  - show (bool|undefined): controlled by parent if boolean; otherwise auto-hide on window load.
 *  - message (string): message text under the animation
 *  - size (number): size in px of the central square (default 260)
 *  - fadeOutMs (number): fade-out duration when hiding (default 350)
 *  - minVisibleMs (number): minimum time (ms) loader remains visible before hiding (default 900)
 */
export default function FullPageLoader({
  show = undefined,
  message = "Preparing RailXpress...",
  size = 260,
  fadeOutMs = 420,
  minVisibleMs = 900,
}) {
  const [internalShow, setInternalShow] = useState(true);
  const [hiding, setHiding] = useState(false);

  const visible = typeof show === "boolean" ? show : internalShow;

  useEffect(() => {
    if (typeof show === "boolean") return;

    let cancelled = false;
    let didHide = false;
    const start = Date.now();

    const startHideSequence = () => {
      if (didHide || cancelled) return;
      didHide = true;
      setHiding(true);
      setTimeout(() => {
        if (!cancelled) setInternalShow(false);
      }, fadeOutMs);
    };

    const scheduleHideRespectingMinTime = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minVisibleMs - elapsed);
      setTimeout(startHideSequence, remaining);
    };

    if (document.readyState === "complete") {
      scheduleHideRespectingMinTime();
    } else {
      const onLoad = () => scheduleHideRespectingMinTime();
      window.addEventListener("load", onLoad, { once: true });
      const fallbackTimer = setTimeout(() => {
        scheduleHideRespectingMinTime();
      }, minVisibleMs + 3000);
      return () => {
        cancelled = true;
        window.removeEventListener("load", onLoad);
        clearTimeout(fallbackTimer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [show, fadeOutMs, minVisibleMs]);

  if (!visible) return null;

  const style = {
    ["--qr-size"]: `${size}px`,
    ["--ring-size"]: `${Math.round(size * 1.6)}px`,
    ["--fade-millis"]: `${fadeOutMs}ms`,
  };

  return (
    <div
      className={`fp-loader-backdrop${hiding ? " fp-hide" : ""}`}
      style={style}
      role="status"
      aria-live="polite"
    >
      {/* Center wrapper ensures ring + frame share exact center */}
      <div className="fp-loader">
        <div className="fp-center-wrap">
          <div className="fp-outer-ring" aria-hidden="true" />
          <div className="fp-qr-frame" aria-hidden="true">
            <div className="fp-checker" aria-hidden="true" />
            <div className="fp-scan-beam" />
            <div className="fp-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="fp-loader-message">{message}</div>
      </div>
    </div>
  );
}

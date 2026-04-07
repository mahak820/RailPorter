import React, { useEffect, useState } from "react";
import "./GridLoader.css";

/**
 * GridLoader
 * Props:
 *  - show (bool|undefined): if boolean -> controlled; otherwise auto-hide on window load
 *  - message (string): optional text under the grid
 *  - minVisibleMs (number): minimum time loader shows in uncontrolled mode (default 900)
 *  - fadeOutMs (number): fade-out duration in ms (default 420)
 */
export default function GridLoader({
  show = undefined,
  message = "Loading RailPorter…",
  minVisibleMs = 900,
  fadeOutMs = 420,
}) {
  const [internalShow, setInternalShow] = useState(true);
  const [hiding, setHiding] = useState(false);
  const visible = typeof show === "boolean" ? show : internalShow;

  useEffect(() => {
    if (typeof show === "boolean") return; // controlled

    let cancelled = false;
    let didHide = false;
    const start = Date.now();

    const startHide = () => {
      if (didHide || cancelled) return;
      didHide = true;
      setHiding(true);
      setTimeout(() => {
        if (!cancelled) setInternalShow(false);
      }, fadeOutMs);
    };

    const scheduleHide = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minVisibleMs - elapsed);
      setTimeout(startHide, remaining);
    };

    if (document.readyState === "complete") {
      scheduleHide();
    } else {
      const onLoad = () => scheduleHide();
      window.addEventListener("load", onLoad, { once: true });
      const fallbackTimer = setTimeout(() => scheduleHide(), minVisibleMs + 3000);
      return () => {
        cancelled = true;
        window.removeEventListener("load", onLoad);
        clearTimeout(fallbackTimer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [show, minVisibleMs, fadeOutMs]);

  if (!visible) return null;

  return (
    <div
      className={`grid-loader-backdrop${hiding ? " hide" : ""}`}
      style={{ ["--fade-ms"]: `${fadeOutMs}ms` }}
      role="status"
      aria-live="polite"
    >
      <div className="grid-loader">
        <div className="stuck-grid" aria-hidden="true">
          {/* 50 items (matching your example) */}
          {[
            "oklch()", "scroll()", "text-box-trim", "pow()", "@property", "top-layer",
            "@view-transition", "var()", "clamp()", "view()", "CSS", "@layer",
            "@swash", "subgrid", "in oklab", ":popover-open", "abs()", "sin()", ":has()", "::marker",
            "1cap", "scrollbar-color", "scroll-timeline", "view-timeline", "overlay", "scale",
            "ascent-override", "initial-letter", "inset", "@container", "accent-color", "color-mix()",
            "@scope", "@starting-style", "override-colors", "anchor()", "scroll-snap", "::backdrop",
            "::cue", ":focus-visible", ":user-valid", ":fullscreen", ":dir()", "caret-color", "aspect-ratio",
            "cross-fade()", "image-set()", "env()", "place-content", "gap"
          ].map((t, i) => (
            <div
              key={i}
              className={`grid-item${t === "CSS" ? " special" : ""}`}
              style={{ ["--index"]: i + 1 }}
            >
              {t === "CSS" ? <b>CSS</b> : t}
            </div>
          ))}
        </div>

        {message ? <div className="grid-loader-message">{message}</div> : null}
      </div>
    </div>
  );
}

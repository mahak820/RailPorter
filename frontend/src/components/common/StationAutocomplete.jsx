// frontend/src/components/common/StationAutocomplete.jsx
import React, { useEffect, useRef, useState } from "react";
import { searchStations } from "../../services/trains";

/**
 * Reusable station autocomplete input.
 *
 * Props:
 *   value       : string (the text in the input — e.g., "Bhopal Jn" or "BPL")
 *   onChange    : (nextValue: string) => void      — called on every keystroke
 *   onSelect    : (station: {code,name,state}) => void — called when user picks an option
 *   emitAs      : "name" | "code"  (default "name")   — what to commit to value when picked
 *   placeholder : string
 *   name, id    : pass-through for form libs
 */
export default function StationAutocomplete({
  value,
  onChange,
  onSelect,
  emitAs = "name",
  placeholder = "Type station name or code",
  name,
  id,
  style,
}) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch suggestions (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = (value || "").trim();
    if (q.length < 1) {
      setItems([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const list = await searchStations(q);
        setItems(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Station search failed:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  function pick(station) {
    const nextVal = emitAs === "code" ? station.code : station.name;
    onChange?.(nextVal);
    onSelect?.(station);
    setOpen(false);
    setHighlight(-1);
  }

  function onKeyDown(e) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? items.length - 1 : h - 1));
    } else if (e.key === "Enter") {
      if (highlight >= 0 && highlight < items.length) {
        e.preventDefault();
        pick(items[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", ...style }}>
      <input
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => {
          onChange?.(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          outline: "none",
          fontSize: 14,
          boxSizing: "border-box",
        }}
      />

      {open && (loading || items.length > 0) && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: 260,
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 6px 24px rgba(15,23,42,0.12)",
            zIndex: 30,
          }}
        >
          {loading && (
            <div style={{ padding: "10px 12px", color: "#64748b", fontSize: 13 }}>
              Searching…
            </div>
          )}
          {!loading &&
            items.map((s, i) => (
              <div
                key={s.code}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  background: i === highlight ? "#f1f5f9" : "transparent",
                  borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>
                  {s.name}{" "}
                  <span style={{ color: "#64748b", fontWeight: 500 }}>({s.code})</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{s.state}</div>
              </div>
            ))}
          {!loading && items.length === 0 && (value || "").trim() && (
            <div style={{ padding: "10px 12px", color: "#64748b", fontSize: 13 }}>
              No stations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

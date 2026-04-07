// frontend/src/components/track/TrackBooking.jsx
import React, { useState, useEffect } from "react";
import { getTimelineByRef, getLatestByRef, getTimelineById } from "../../services/tracking";


// note: we have getTimelineById in tracking.js

export default function TrackBooking() {
  const [input, setInput] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);

  // helper: decide whether string looks like a bookingRef (RX-...) or an id
  function looksLikeRef(s) {
    if (!s) return false;
    return /^RX[-_A-Z0-9]+/i.test(s.trim());
  }

  async function lookup(val) {
    setError(null);
    setLoading(true);
    setTimeline([]);
    setLatest(null);

    const trimmed = (val || "").trim();
    if (!trimmed) {
      setError("Please enter bookingRef or bookingId");
      setLoading(false);
      return;
    }

    try {
      let tl = null;
      let lt = null;

      if (looksLikeRef(trimmed)) {
        // try ref endpoints
        try {
          console.log("Trying timeline by ref:", trimmed);
          tl = await getTimelineByRef(trimmed);
          lt = await getLatestByRef(trimmed);
        } catch (eRef) {
          // if ref lookup fails, fall through to try as bookingId
          console.warn("ref lookup failed:", eRef);
          // attempt by id below
        }
      }

      if (!tl) {
        // attempt bookingId timeline
        try {
          console.log("Trying timeline by bookingId:", trimmed);
          tl = await getTimelineById(trimmed);
          // latest by id not implemented separately; pick first item as latest
          lt = (tl && tl.length > 0) ? tl[0] : null;
        } catch (eId) {
          console.error("bookingId lookup failed:", eId);
          throw eId; // bubble up to outer catch
        }
      }

      setTimeline(Array.isArray(tl) ? tl : []);
      setLatest(lt || null);
    } catch (e) {
      // e is the thrown Error from tracking.js (contains message)
      console.error("Lookup error:", e);
      setError(e.message || "Lookup failed — see console/network tab");
    } finally {
      setLoading(false);
    }
  }

  // polling
  useEffect(() => {
    if (!polling || !input) return;
    const id = setInterval(() => lookup(input), 8000);
    return () => clearInterval(id);
  }, [polling, input]);

  return (
    <div style={{ padding: 20, maxWidth: 960, margin: "0 auto" }}>
      <h2>Track Your Luggage</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter bookingRef (e.g. RX-ABC123) or bookingId (UUID)"
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={() => lookup(input)} style={{ padding: "8px 12px" }}>Lookup</button>
        <button onClick={() => setPolling((p) => !p)} style={{ padding: "8px 12px" }}>
          {polling ? "Stop auto-refresh" : "Auto-refresh"}
        </button>
      </div>

      {error && <div style={{ color: "#e11d48", marginBottom: 12 }}>{error}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Loading…</div>}

      {latest && (
        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>Current status:</strong> {latest.status}
          <div style={{ fontSize: 13, color: "#666" }}>{latest.location} — {new Date(latest.createdAt).toLocaleString()}</div>
        </div>
      )}

      <h3>Timeline</h3>
      {timeline.length === 0 && <div style={{ color: "#6b7280" }}>No updates yet.</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {timeline.map(item => (
          <li key={item.id} style={{ padding: 10, borderBottom: "1px solid #f6f6f6" }}>
            <div style={{ fontWeight: 700 }}>{item.status}</div>
            <div style={{ color: "#333" }}>{item.location}</div>
            <div style={{ color: "#666", fontSize: 13 }}>{item.notes}</div>
            <div style={{ color: "#999", fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20, fontSize: 13, color: "#666" }}>
        Tip: Open browser DevTools → Network to see the exact request URL that the UI used (helps debug 404s).
      </div>
    </div>
  );
}

// frontend/src/components/track/TrackBooking.jsx
import { useState, useEffect } from "react";
import { getTimelineByRef, getLatestByRef, getTimelineById } from "../../services/tracking";
import { Link } from "react-router-dom";

const statusColors = {
  CREATED:    { bg: "rgba(99,102,241,0.15)",  color: "#6366f1" },
  PICKED_UP:  { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  IN_TRANSIT: { bg: "rgba(6,182,212,0.15)",    color: "#06b6d4" },
  ARRIVED:    { bg: "rgba(16,185,129,0.15)",   color: "#10b981" },
  DELIVERED:  { bg: "rgba(16,185,129,0.15)",   color: "#10b981" },
};

function StatusBadge({ status }) {
  const s = statusColors[status] || { bg: "rgba(107,114,128,0.15)", color: "#6b7280" };
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 20,
      background: s.bg, color: s.color, fontSize: 12, fontWeight: 700
    }}>
      {status}
    </span>
  );
}

export default function TrackBooking() {
  const [input, setInput] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);

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
        try {
          tl = await getTimelineByRef(trimmed);
          lt = await getLatestByRef(trimmed);
        } catch (eRef) {
          console.warn("ref lookup failed:", eRef);
        }
      }

      if (!tl) {
        try {
          tl = await getTimelineById(trimmed);
          lt = (tl && tl.length > 0) ? tl[0] : null;
        } catch (eId) {
          throw eId;
        }
      }

      setTimeline(Array.isArray(tl) ? tl : []);
      setLatest(lt || null);
    } catch (e) {
      setError(e.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!polling || !input) return;
    const id = setInterval(() => lookup(input), 8000);
    return () => clearInterval(id);
  }, [polling, input]);

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/" style={{ color: "var(--brand-grad-start, #2563eb)", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>← Back to Home</Link>
          <h2 style={{ marginTop: 12, fontSize: 24, fontWeight: 700 }}>Track Your Luggage</h2>
          <p style={{ color: "var(--muted, #6b7280)", fontSize: 14 }}>Enter your booking reference (RX-XXXXXX) or booking ID to track</p>
        </div>

        {/* Search bar */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup(input)}
              placeholder="e.g. RX-A1B2C3D4 or UUID"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => lookup(input)} disabled={loading}>
              {loading ? "Searching..." : "Track"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setPolling((p) => !p)}
              style={ polling ? { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid #ef4444" } : {}}
            >
              {polling ? "Stop" : "Auto-refresh"}
            </button>
          </div>
          {error && <div style={{ color: "#ef4444", marginTop: 10, fontSize: 13 }}>{error}</div>}
          {polling && <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted, #6b7280)" }}>Auto-refreshing every 8 seconds...</div>}
        </div>

        {/* Current Status Card */}
        {latest && (
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16 }}>Current Status</h3>
              <StatusBadge status={latest.status} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}>Location</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{latest.location || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}>Last Updated</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{new Date(latest.createdAt).toLocaleString()}</div>
              </div>
              {latest.notes && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}>Notes</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{latest.notes}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {(timeline.length > 0 || loading) && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Tracking Timeline</h3>
            {timeline.length === 0 && !loading && (
              <div style={{ color: "var(--muted, #6b7280)", textAlign: "center", padding: 20 }}>No status updates yet.</div>
            )}
            <div style={{ position: "relative", paddingLeft: 24 }}>
              {/* Vertical line */}
              {timeline.length > 1 && (
                <div style={{
                  position: "absolute", left: 7, top: 8, bottom: 8, width: 2,
                  background: "linear-gradient(180deg, #2563eb, #8b5cf6)"
                }} />
              )}
              {timeline.map((item, idx) => (
                <div key={item.id} style={{ position: "relative", paddingBottom: idx < timeline.length - 1 ? 20 : 0 }}>
                  {/* Dot */}
                  <div style={{
                    position: "absolute", left: -20, top: 4, width: 16, height: 16, borderRadius: "50%",
                    background: idx === 0
                      ? "linear-gradient(135deg, #2563eb, #8b5cf6)"
                      : "var(--border, #e6e9ee)",
                    border: "2px solid var(--card-bg, #fff)"
                  }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <StatusBadge status={item.status} />
                      <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{item.location || "—"}</div>
                      {item.notes && <div style={{ color: "var(--muted, #6b7280)", fontSize: 13, marginTop: 2 }}>{item.notes}</div>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted, #6b7280)", whiteSpace: "nowrap", marginLeft: 12 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!latest && !loading && timeline.length === 0 && !error && (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>Enter your tracking ID</h3>
            <p style={{ color: "var(--muted, #6b7280)", fontSize: 14 }}>
              Your booking reference starts with <strong>RX-</strong> and was provided when you created the booking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

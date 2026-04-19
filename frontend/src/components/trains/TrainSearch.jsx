// frontend/src/components/trains/TrainSearch.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StationAutocomplete from "../common/StationAutocomplete";
import { searchTrains, getTrainRoute } from "../../services/trains";

const todayIso = new Date().toISOString().split("T")[0];

export default function TrainSearch() {
  const navigate = useNavigate?.() || (() => {});
  const [fromText, setFromText] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toText, setToText] = useState("");
  const [toCode, setToCode] = useState("");
  const [date, setDate] = useState(todayIso);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [routeLoading, setRouteLoading] = useState(null); // trainNo being fetched
  const [routes, setRoutes] = useState({}); // { trainNo: {trainName, stops[]} }
  const [expanded, setExpanded] = useState({}); // { trainNo: true }

  async function handleSearch(e) {
    e?.preventDefault?.();
    setError(null);
    setResult(null);
    setRoutes({});
    setExpanded({});

    if (!fromCode || !toCode) {
      setError("Please pick both From and To stations from the dropdown.");
      return;
    }
    if (fromCode === toCode) {
      setError("From and To stations must be different.");
      return;
    }

    setLoading(true);
    try {
      const data = await searchTrains({ from: fromCode, to: toCode, date });
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch trains");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRoute(trainNo) {
    const isOpen = !!expanded[trainNo];
    setExpanded((s) => ({ ...s, [trainNo]: !isOpen }));
    if (isOpen || routes[trainNo]) return;

    setRouteLoading(trainNo);
    try {
      const data = await getTrainRoute(trainNo);
      setRoutes((r) => ({ ...r, [trainNo]: data }));
    } catch (err) {
      setError(err.message || "Failed to fetch route");
    } finally {
      setRouteLoading(null);
    }
  }

  function swapStations() {
    setFromText(toText);
    setFromCode(toCode);
    setToText(fromText);
    setToCode(fromCode);
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}
        >
          ← Back to Home
        </a>

        <h2 style={{ marginTop: 16, marginBottom: 24, color: "#0f172a" }}>
          Search Trains
        </h2>

        <form
          onSubmit={handleSearch}
          style={{
            background: "#ffffff",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr 1fr",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ fontSize: 13, color: "#475569", display: "block", marginBottom: 6 }}>
                From
              </label>
              <StationAutocomplete
                value={fromText}
                onChange={(v) => { setFromText(v); setFromCode(""); }}
                onSelect={(s) => { setFromText(`${s.name} (${s.code})`); setFromCode(s.code); }}
                placeholder="e.g., Bhopal or BPL"
              />
            </div>

            <button
              type="button"
              onClick={swapStations}
              title="Swap From/To"
              style={{
                background: "#e2e8f0",
                border: "none",
                borderRadius: 8,
                width: 40,
                height: 40,
                cursor: "pointer",
                fontSize: 18,
                color: "#475569",
              }}
            >
              ⇄
            </button>

            <div>
              <label style={{ fontSize: 13, color: "#475569", display: "block", marginBottom: 6 }}>
                To
              </label>
              <StationAutocomplete
                value={toText}
                onChange={(v) => { setToText(v); setToCode(""); }}
                onSelect={(s) => { setToText(`${s.name} (${s.code})`); setToCode(s.code); }}
                placeholder="e.g., Delhi or NDLS"
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#475569", display: "block", marginBottom: 6 }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 16,
              padding: "12px 24px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Searching…" : "Search Trains"}
          </button>

          {error && (
            <div style={{ color: "#dc2626", marginTop: 12, fontSize: 14 }}>
              {error}
            </div>
          )}
        </form>

        {result && (
          <div>
            <div style={{ fontSize: 14, color: "#475569", marginBottom: 12 }}>
              <b>{result.count}</b> train{result.count === 1 ? "" : "s"} found
              {" "}from <b>{result.from}</b> to <b>{result.to}</b>
              {result.date ? <> on <b>{result.date}</b></> : null}
            </div>

            {result.count === 0 && (
              <div
                style={{
                  background: "#fef9c3",
                  border: "1px solid #fde68a",
                  borderRadius: 8,
                  padding: 16,
                  color: "#854d0e",
                  fontSize: 14,
                }}
              >
                No direct trains found between these stations in our database.
                Try another pair (e.g., BCT → NDLS, HWH → NDLS, BPL → NDLS).
              </div>
            )}

            {result.trains?.map((t) => {
              const isOpen = !!expanded[t.trainNo];
              const route = routes[t.trainNo];
              const isLoadingRoute = routeLoading === t.trainNo;

              return (
                <div
                  key={t.trainNo}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {t.trainNo}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                        {t.trainName}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                          {t.departure}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {t.fromName} ({t.fromCode})
                        </div>
                      </div>

                      <div style={{ color: "#94a3b8", fontSize: 20 }}>→</div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                          {t.arrival}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {t.toName} ({t.toCode})
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRoute(t.trainNo)}
                      style={{
                        background: isOpen ? "#e0e7ff" : "#f1f5f9",
                        color: "#2563eb",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {isOpen ? "Hide Route" : "View Route"}
                    </button>
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        marginTop: 16,
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: 12,
                      }}
                    >
                      {isLoadingRoute && (
                        <div style={{ color: "#64748b", fontSize: 13 }}>
                          Loading route…
                        </div>
                      )}

                      {route && (
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 13,
                          }}
                        >
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              <th style={thStyle}>#</th>
                              <th style={thStyle}>Station</th>
                              <th style={thStyle}>Arrives</th>
                              <th style={thStyle}>Departs</th>
                              <th style={thStyle}>Halt</th>
                              <th style={thStyle}>Day</th>
                            </tr>
                          </thead>
                          <tbody>
                            {route.stops?.map((s) => (
                              <tr key={s.sequenceNo} style={{ borderTop: "1px solid #f1f5f9" }}>
                                <td style={tdStyle}>{s.sequenceNo}</td>
                                <td style={tdStyle}>
                                  <b>{s.stationName}</b>{" "}
                                  <span style={{ color: "#64748b" }}>
                                    ({s.stationCode})
                                  </span>
                                </td>
                                <td style={tdStyle}>{s.arrivalTime || "—"}</td>
                                <td style={tdStyle}>{s.departureTime || "—"}</td>
                                <td style={tdStyle}>
                                  {s.haltMinutes ? `${s.haltMinutes} min` : "—"}
                                </td>
                                <td style={tdStyle}>Day {s.dayNo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  color: "#475569",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyle = {
  padding: "10px 12px",
  color: "#0f172a",
};

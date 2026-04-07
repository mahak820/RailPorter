// frontend/src/services/tracking.js
const API_BASE = import.meta.env.VITE_API_BASE || "";

async function jsonFetch(url, opts = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Accept": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || res.statusText || "API error");
  }
  // try to parse JSON; if no JSON body return null
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

export async function getTimelineByRef(bookingRef) {
  return jsonFetch(`/api/track/ref/${encodeURIComponent(bookingRef)}/timeline`);
}

export async function getLatestByRef(bookingRef) {
  return jsonFetch(`/api/track/ref/${encodeURIComponent(bookingRef)}/latest`);
}

// Admin / internal endpoints
export async function getTimelineById(bookingId) {
  return jsonFetch(`/api/track/booking/${encodeURIComponent(bookingId)}/timeline`);
}

export async function pushStatus(bookingId, { status, location = "", notes = "" }) {
  return jsonFetch(`/api/track/booking/${encodeURIComponent(bookingId)}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, location, notes }),
  });
}

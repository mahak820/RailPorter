// frontend/src/services/bookings.js
const API_BASE = import.meta.env.VITE_API_BASE || "";

async function jsonFetch(url, opts = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Accept": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(txt || res.statusText || "API error");
  }
  // if no body (204) return null
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

export async function estimateBooking({ departureStation, arrivalStation, weightKg }) {
  return jsonFetch("/api/bookings/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ departureStation, arrivalStation, weightKg }),
  });
}

export async function createBooking(payload) {
  return jsonFetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function uploadFiles(bookingId, files = []) {
  if (!files || files.length === 0) return null;
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("File upload failed");
  return res.json();
}

export async function getBooking(id) {
  return jsonFetch(`/api/bookings/${id}`);
}

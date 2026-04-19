// frontend/src/services/trains.js
const API_BASE = import.meta.env.VITE_API_BASE || "";

async function jsonFetch(url) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || res.statusText || "API error");
  }
  return res.json();
}

// #3 Station search (autocomplete)
export async function searchStations(query) {
  const q = (query || "").trim();
  const url = q
    ? `/api/stations?search=${encodeURIComponent(q)}`
    : `/api/stations`;
  return jsonFetch(url);
}

// #1 Train search by from/to
export async function searchTrains({ from, to, date }) {
  const params = new URLSearchParams();
  params.set("from", (from || "").toUpperCase());
  params.set("to", (to || "").toUpperCase());
  if (date) params.set("date", date);
  return jsonFetch(`/api/trains?${params.toString()}`);
}

// #2 Train route / halts
export async function getTrainRoute(trainNo) {
  return jsonFetch(`/api/train/${encodeURIComponent(trainNo)}/route`);
}

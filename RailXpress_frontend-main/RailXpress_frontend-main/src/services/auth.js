// src/services/auth.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || ""; // e.g. "http://localhost:8080"

export async function register(payload) {
  // payload: { fullName, email, phone, password }
  const res = await axios.post(`${API_BASE}/api/auth/register`, payload);
  return res.data; // expect created user or similar
}

export async function login(payload) {
  // payload: { email, password }
  const res = await axios.post(`${API_BASE}/api/auth/login`, payload);
  // expect { token: "...", user: { ... } } or similar
  return res.data;
}

export function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete axios.defaults.headers.common["Authorization"];
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

import axios from "axios";

const baseURL = String(import.meta.env.VITE_API_URL || "").trim();

if (!baseURL) {
  // Fail fast during development; in production, provide VITE_API_URL.
  // eslint-disable-next-line no-console
  console.warn("VITE_API_URL is not set. API calls will fail.");
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("admin_jwt");
    return;
  }

  const header = `Bearer ${token}`;
  api.defaults.headers.common["Authorization"] = header;
  localStorage.setItem("admin_jwt", token);
}

export function loadAuthToken() {
  const token = localStorage.getItem("admin_jwt");
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}


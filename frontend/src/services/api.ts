import axios from "axios";

const API_BASE_URL = String(
  import.meta.env.VITE_API_URL || "http://localhost:5000",
).trim();

const ADMIN_API_BASE_URL = String(
  import.meta.env.VITE_ADMIN_API_URL || `${API_BASE_URL}/admin`,
).trim();

if (!API_BASE_URL) {
  console.warn("VITE_API_URL is not set. API calls will fail.");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    delete adminApi.defaults.headers.common.Authorization;
    localStorage.removeItem("admin_jwt");
    return;
  }

  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  localStorage.setItem("admin_jwt", token);
}

export function loadAuthToken() {
  const token = localStorage.getItem("admin_jwt");
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

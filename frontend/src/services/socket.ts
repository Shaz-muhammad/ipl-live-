import { io, type Socket } from "socket.io-client";

const SOCKET_URL = String(
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
).trim();

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket) return socket;

  if (!SOCKET_URL) {
    console.warn("VITE_API_BASE_URL is not set. Socket connection will fail.");
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

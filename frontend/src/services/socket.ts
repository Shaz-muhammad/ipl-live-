import { io, type Socket } from "socket.io-client";

const url = String(import.meta.env.VITE_SOCKET_URL || "").trim();

let socket: Socket | null = null;

export function connectSocket() {
  if (socket) return socket;

  if (!url) {
    // eslint-disable-next-line no-console
    console.warn("VITE_SOCKET_URL is not set. Socket connection will fail.");
  }

  socket = io(url, {
    autoConnect: true,
    transports: ["websocket"],
  });

  return socket;
}

export function getSocket() {
  return socket;
}


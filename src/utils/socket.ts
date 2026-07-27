import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ No se pudo conectar el socket de notificaciones en vivo:", err.message);
    });
  }
  return socket;
};

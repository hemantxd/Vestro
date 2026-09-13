import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { AuthPayload } from "../common/types/index.js";

// userId -> set of connected sockets
const userSockets = new Map<string, Set<WebSocket>>();
// socket -> set of conversationIds the client is currently viewing
const socketRooms = new Map<WebSocket, Set<string>>();
// userId -> userId (parsed at connect)

export function isUserOnline(userId: string): boolean {
  const sockets = userSockets.get(userId);
  return !!sockets && sockets.size > 0;
}

function sendJson(ws: WebSocket, payload: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function handleSubscribe(userId: string, ws: WebSocket, conversationIds: string[]) {
  const rooms = socketRooms.get(ws) || new Set<string>();
  for (const cid of conversationIds) rooms.add(cid);
  socketRooms.set(ws, rooms);

  // Notify the client it is subscribed.
  sendJson(ws, { type: "subscribed", conversationIds: [...rooms] });
}

// Broadcast a new message to all connected sockets of the OTHER members.
export function broadcastMessage(message: any, memberIds: string[]) {
  const payload = { type: "message:new", data: message };
  for (const memberId of memberIds) {
    const sockets = userSockets.get(memberId);
    if (!sockets) continue;
    for (const ws of sockets) {
      // Only deliver to sockets subscribed to this conversation.
      const rooms = socketRooms.get(ws);
      if (rooms && rooms.has(message.conversationId)) {
        sendJson(ws, payload);
      }
    }
  }
}

export function createChatWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    let userId: string | null = null;

    // Auth via query token: /ws?token=<jwt>
    try {
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const token = url.searchParams.get("token");
      if (token) {
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
        userId = decoded.userId;
      }
    } catch {
      userId = null;
    }

    if (!userId) {
      sendJson(ws, { type: "error", message: "Unauthorized" });
      ws.close(4001, "Unauthorized");
      return;
    }

    // Register socket for this user.
    const set = userSockets.get(userId) || new Set<WebSocket>();
    set.add(ws);
    userSockets.set(userId, set);
    socketRooms.set(ws, new Set());

    sendJson(ws, { type: "connected", userId });

    ws.on("message", (raw: string) => {
      try {
        const payload = JSON.parse(raw as string);
        if (payload.type === "subscribe" && Array.isArray(payload.conversationIds)) {
          handleSubscribe(userId as string, ws, payload.conversationIds);
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      userSockets.get(userId as string)?.delete(ws);
      socketRooms.delete(ws);
    });

    ws.on("error", () => {
      userSockets.get(userId as string)?.delete(ws);
      socketRooms.delete(ws);
    });
  });

  logger.info("Chat WebSocket server ready on /ws");
  return wss;
}
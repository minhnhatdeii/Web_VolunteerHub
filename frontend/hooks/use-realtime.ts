"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { Event } from "@/types/event";

type EventHandler = (event: Event) => void;
type RefreshHandler = (payload: { eventId?: string; type?: string }) => void;
type PostHandler = (payload: any) => void;
type CommentHandler = (payload: any) => void;

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ||
  (process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api$/, "")
    : "http://localhost:5000");

const WS_PATH = process.env.NEXT_PUBLIC_WS_PATH || "/socket.io";

/**
 * Subscribe to realtime updates for a single event namespace (/events/:id)
 */
export function useEventRealtime(
  eventId: string | undefined,
  handlers: {
    onEventUpdate?: EventHandler;
    onPostUpdate?: PostHandler;
    onCommentUpdate?: CommentHandler;
  }
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const socket = io(`${WS_BASE_URL}/events/${eventId}`, {
      transports: ["websocket"],
      path: WS_PATH,
    });

    socketRef.current = socket;

    socket.on("event:update", (payload: any) => {
      const evt: Event | undefined = payload?.event;
      if (evt?.id === eventId) {
        handlers.onEventUpdate?.(evt);
      }
    });

    socket.on("post:update", (payload: any) => {
      handlers.onPostUpdate?.(payload);
    });

    socket.on("comment:update", (payload: any) => {
      handlers.onCommentUpdate?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [eventId, handlers.onEventUpdate, handlers.onPostUpdate, handlers.onCommentUpdate]);
}

/**
 * Subscribe to root-level events: events:refresh tells UI to refetch list/detail if needed.
 */
export function useEventsRefresh(onRefresh?: RefreshHandler) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(WS_BASE_URL, {
      transports: ["websocket"],
      path: WS_PATH,
    });
    socketRef.current = socket;

    socket.on("events:refresh", (payload: any) => {
      onRefresh?.(payload || {});
    });

    return () => {
      socket.disconnect();
    };
  }, [onRefresh]);
}

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ClientMessage, ServerMessage } from '../../../shared/types';

interface UseWebSocketReturn {
  connected: boolean;
  send: (message: ClientMessage) => void;
  connect: (url: string) => void;
  disconnect: () => void;
  onMessage: (handler: (msg: ServerMessage) => void) => void;
}

const MAX_RETRIES = 5;
const RECONNECT_DELAY = 2000;

export function useWebSocket(): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const urlRef = useRef<string | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pendingMessagesRef = useRef<ClientMessage[]>([]);
  const messageHandlerRef = useRef<((msg: ServerMessage) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback((url: string) => {
    cleanup();
    urlRef.current = url;
    retriesRef.current = 0;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
      // Flush any pending messages
      while (pendingMessagesRef.current.length > 0) {
        const msg = pendingMessagesRef.current.shift()!;
        ws.send(JSON.stringify(msg));
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (retriesRef.current < MAX_RETRIES && urlRef.current) {
        retriesRef.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (urlRef.current) {
            connect(urlRef.current);
          }
        }, RECONNECT_DELAY);
      }
    };

    ws.onerror = () => {
      setConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        if (messageHandlerRef.current) {
          messageHandlerRef.current(message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }, [cleanup]);

  const disconnect = useCallback(() => {
    urlRef.current = null;
    cleanup();
    setConnected(false);
  }, [cleanup]);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      pendingMessagesRef.current.push(message);
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, []);

  const onMessage = useCallback((handler: (msg: ServerMessage) => void) => {
    messageHandlerRef.current = handler;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connected,
    send,
    connect,
    disconnect,
    onMessage,
  };
}

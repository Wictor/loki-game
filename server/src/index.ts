import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ClientMessage, ServerMessage } from '../../shared/types';
import { GameRoom } from './GameRoom';
import { handleMessage, BroadcastFn, SendFn } from './messages';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

// State
const rooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, string>(); // playerId -> roomCode
const connections = new Map<WebSocket, { playerId: string | null; roomCode: string | null }>();
const playerToWs = new Map<string, WebSocket>();

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: rooms.size,
    connections: connections.size,
  });
});

// Send message to a specific player
const send: SendFn = (playerId: string, message: ServerMessage) => {
  const ws = playerToWs.get(playerId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};

// Broadcast message to all players in a room
const broadcast: BroadcastFn = (roomCode: string, message: ServerMessage, exclude?: string) => {
  const room = rooms.get(roomCode);
  if (!room) return;

  for (const [playerId] of room.players) {
    if (playerId === exclude) continue;
    send(playerId, message);
  }
};

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  connections.set(ws, { playerId: null, roomCode: null });

  ws.on('message', (data: Buffer) => {
    try {
      const msg: ClientMessage = JSON.parse(data.toString());
      const conn = connections.get(ws);
      if (!conn) return;

      // Wrap send/broadcast so new players (not yet in playerToWs)
      // fall back to the current ws connection
      const wrappedSend: SendFn = (playerId: string, message: ServerMessage) => {
        const targetWs = playerToWs.get(playerId) || ws;
        if (targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify(message));
        }
      };

      const wrappedBroadcast: BroadcastFn = (roomCode: string, message: ServerMessage, exclude?: string) => {
        const room = rooms.get(roomCode);
        if (!room) return;
        for (const [playerId] of room.players) {
          if (playerId === exclude) continue;
          wrappedSend(playerId, message);
        }
      };

      const result = handleMessage(
        msg,
        conn.playerId,
        rooms,
        playerRooms,
        wrappedSend,
        wrappedBroadcast
      );

      // Update connection with new IDs
      if (result.playerId) {
        conn.playerId = result.playerId;
        playerToWs.set(result.playerId, ws);
        console.log(`Player ${result.playerId} connected`);
      }
      if (result.roomCode) {
        conn.roomCode = result.roomCode;
        console.log(`Room ${result.roomCode} ${msg.type === 'CREATE_GAME' ? 'created' : 'joined'}`);
      }
    } catch (error: any) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: error.message || 'Failed to process message',
      }));
    }
  });

  ws.on('close', () => {
    const conn = connections.get(ws);
    if (!conn) return;

    const { playerId, roomCode } = conn;

    if (playerId && roomCode) {
      const room = rooms.get(roomCode);
      if (room) {
        room.removePlayer(playerId);
        console.log(`Player ${playerId} left room ${roomCode}`);

        // Notify other players
        broadcast(roomCode, {
          type: 'PLAYER_LEFT',
          playerId,
          players: room.getPlayerList(),
        });

        // Clean up empty rooms
        if (room.players.size === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted (empty)`);
        }
      }

      playerRooms.delete(playerId);
      playerToWs.delete(playerId);
    }

    connections.delete(ws);
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

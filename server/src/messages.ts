import { ClientMessage, ServerMessage, ROLE_REVEAL_DURATION } from '../../shared/types';
import { GameRoom } from './GameRoom';
import { WordBank } from './WordBank';
import { TurnManager } from './TurnManager';

export type BroadcastFn = (roomCode: string, message: ServerMessage, exclude?: string) => void;
export type SendFn = (playerId: string, message: ServerMessage) => void;

export function handleMessage(
  msg: ClientMessage,
  playerId: string | null,
  rooms: Map<string, GameRoom>,
  playerRooms: Map<string, string>,
  send: SendFn,
  broadcast: BroadcastFn
): { playerId?: string; roomCode?: string } {
  try {
    switch (msg.type) {
      case 'CREATE_GAME': {
        const room = new GameRoom();
        rooms.set(room.roomCode, room);

        const player = room.addPlayer(msg.hostName, true);
        const newPlayerId = player.id;
        playerRooms.set(newPlayerId, room.roomCode);

        send(newPlayerId, {
          type: 'GAME_CREATED',
          roomCode: room.roomCode,
          player: player.toData(),
        });

        return { playerId: newPlayerId, roomCode: room.roomCode };
      }

      case 'JOIN_GAME': {
        const room = rooms.get(msg.roomCode);
        if (!room) {
          if (playerId) {
            send(playerId, { type: 'ERROR', message: 'Room not found' });
          }
          return {};
        }

        const player = room.addPlayer(msg.playerName, false);
        const newPlayerId = player.id;
        playerRooms.set(newPlayerId, msg.roomCode);

        broadcast(msg.roomCode, {
          type: 'PLAYER_JOINED',
          player: player.toData(),
          players: room.getPlayerList(),
        });

        return { playerId: newPlayerId, roomCode: msg.roomCode };
      }

      case 'PLAYER_READY': {
        if (!playerId) {
          return {};
        }

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) {
          send(playerId, { type: 'ERROR', message: 'You are not in a room' });
          return {};
        }

        const room = rooms.get(roomCode);
        if (!room) {
          send(playerId, { type: 'ERROR', message: 'Room not found' });
          return {};
        }

        room.togglePlayerReady(playerId);
        const player = room.players.get(playerId);

        if (player) {
          broadcast(roomCode, {
            type: 'PLAYER_READY_UPDATE',
            playerId,
            isReady: player.isReady,
            players: room.getPlayerList(),
          });
        }

        return {};
      }

      case 'START_GAME': {
        if (!playerId) {
          return {};
        }

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) {
          send(playerId, { type: 'ERROR', message: 'You are not in a room' });
          return {};
        }

        const room = rooms.get(roomCode);
        if (!room) {
          send(playerId, { type: 'ERROR', message: 'Room not found' });
          return {};
        }

        const player = room.players.get(playerId);
        if (!player || !player.isHost) {
          send(playerId, { type: 'ERROR', message: 'Only the host can start the game' });
          return {};
        }

        room.startGame(msg.settings);

        // Send GAME_STARTING to each player with their role and word
        for (const [pid] of room.players) {
          const assignment = room.getRoleForPlayer(pid);
          send(pid, {
            type: 'GAME_STARTING',
            role: assignment.role,
            word: assignment.word,
            turnOrder: room.turnManager!.getTurnOrder(),
            players: room.getPlayerList(),
            settings: room.settings,
          });
        }

        // After ROLE_REVEAL_DURATION, transition to drawing and send TURN_START
        setTimeout(() => {
          room.startDrawing();
          broadcast(roomCode, {
            type: 'TURN_START',
            activePlayerId: room.turnManager!.getCurrentPlayerId(),
            round: room.turnManager!.getCurrentRound(),
            timeLimit: room.settings.drawTimeLimit,
          });
        }, ROLE_REVEAL_DURATION);

        return {};
      }

      case 'SUBMIT_STROKE': {
        if (!playerId) {
          return {};
        }

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) {
          send(playerId, { type: 'ERROR', message: 'You are not in a room' });
          return {};
        }

        const room = rooms.get(roomCode);
        if (!room) {
          send(playerId, { type: 'ERROR', message: 'Room not found' });
          return {};
        }

        // Stamp the server-side playerId on the stroke
        const stroke = { ...msg.stroke, playerId };

        room.submitStroke(playerId, stroke);

        // Broadcast the stroke with correct playerId
        broadcast(roomCode, {
          type: 'STROKE_BROADCAST',
          stroke,
        });

        // submitStroke already advances the turn and may transition to VOTING
        if (room.phase === 'VOTING') {
          // All turns complete, voting started by submitStroke
          broadcast(roomCode, {
            type: 'VOTING_START',
            players: room.getPlayerList(),
          });
        } else if (room.turnManager && !room.turnManager.isComplete()) {
          // Still drawing, send next turn
          broadcast(roomCode, {
            type: 'TURN_START',
            activePlayerId: room.turnManager.getCurrentPlayerId(),
            round: room.turnManager.getCurrentRound(),
            timeLimit: room.settings.drawTimeLimit,
          });
        }

        return {};
      }

      case 'SUBMIT_VOTE': {
        if (!playerId) {
          return {};
        }

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) {
          send(playerId, { type: 'ERROR', message: 'You are not in a room' });
          return {};
        }

        const room = rooms.get(roomCode);
        if (!room) {
          send(playerId, { type: 'ERROR', message: 'Room not found' });
          return {};
        }

        room.submitVote(playerId, msg.votedPlayerId);

        broadcast(roomCode, {
          type: 'VOTE_CAST',
          voterId: playerId,
        });

        // Check if all votes are in
        if (room.allVotesIn()) {
          const voteResult = room.resolveVotes();

          broadcast(roomCode, {
            type: 'VOTE_RESULT',
            votes: voteResult.votes,
            caughtPlayerId: voteResult.caughtPlayerId,
            isTie: voteResult.isTie,
          });

          // If imposter was caught, move to IMPOSTER_GUESS phase
          if (room.votingManager?.isCaughtPlayerImposter()) {
            const imposterId = room.roleAssignments.find((r) => r.role === 'imposter')!.playerId;
            room.phase = 'IMPOSTER_GUESS';

            broadcast(roomCode, {
              type: 'IMPOSTER_GUESS_PHASE',
              imposterId,
            });
          } else {
            // Otherwise go straight to scoreboard
            const result = room.calculateScores();
            room.phase = 'SCOREBOARD';

            broadcast(roomCode, {
              type: 'ROUND_RESULT',
              result,
            });
          }
        }

        return {};
      }

      case 'SUBMIT_GUESS': {
        if (!playerId) {
          return {};
        }

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) {
          send(playerId, { type: 'ERROR', message: 'You are not in a room' });
          return {};
        }

        const room = rooms.get(roomCode);
        if (!room) {
          send(playerId, { type: 'ERROR', message: 'Room not found' });
          return {};
        }

        room.submitImposterGuess(msg.word);

        // Calculate scores and show results
        const result = room.calculateScores();
        room.phase = 'SCOREBOARD';

        broadcast(roomCode, {
          type: 'ROUND_RESULT',
          result,
        });

        return {};
      }

      case 'REQUEST_TIMEOUT':
      case 'CANCEL_TIMEOUT': {
        if (!playerId) return {};

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) return {};

        const room = rooms.get(roomCode);
        if (!room) return {};

        if (!room.timeoutRequests) room.timeoutRequests = new Set();

        if (msg.type === 'REQUEST_TIMEOUT') {
          room.timeoutRequests.add(playerId);
        } else {
          room.timeoutRequests.delete(playerId);
        }

        broadcast(roomCode, {
          type: 'TIMEOUT_UPDATE',
          timeoutPlayerIds: Array.from(room.timeoutRequests),
        });

        return {};
      }

      case 'NEXT_ROUND': {
        if (!playerId) {
          return {};
        }

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) {
          send(playerId, { type: 'ERROR', message: 'You are not in a room' });
          return {};
        }

        const room = rooms.get(roomCode);
        if (!room) {
          send(playerId, { type: 'ERROR', message: 'Room not found' });
          return {};
        }

        const player = room.players.get(playerId);
        if (!player || !player.isHost) {
          send(playerId, { type: 'ERROR', message: 'Only the host can start the next round' });
          return {};
        }

        // Check if someone already won
        for (const p of room.players.values()) {
          if (p.score >= room.settings.winScore) {
            send(playerId, { type: 'ERROR', message: 'Game is over! Use Play Again to return to lobby.' });
            return {};
          }
        }

        // Start a new round without going through lobby
        // Pick new word
        room.secretWord = room.settings.customWord || new WordBank().getRandomWord(room.settings.category);

        // Create new turn manager
        const playerIds = Array.from(room.players.keys());
        room.turnManager = new TurnManager(playerIds, room.settings.rounds);

        // Reassign roles
        room.roleAssignments = room.assignRoles();

        // Reset round state
        room.strokes = [];
        room.votingManager = null;
        room.timeoutRequests.clear();

        room.phase = 'ROLE_REVEAL';

        // Send GAME_STARTING to each player with their new role and word
        for (const [pid] of room.players) {
          const assignment = room.getRoleForPlayer(pid);
          send(pid, {
            type: 'GAME_STARTING',
            role: assignment.role,
            word: assignment.word,
            turnOrder: room.turnManager!.getTurnOrder(),
            players: room.getPlayerList(),
            settings: room.settings,
          });
        }

        // After ROLE_REVEAL_DURATION, transition to drawing
        setTimeout(() => {
          room.startDrawing();
          broadcast(roomCode, {
            type: 'TURN_START',
            activePlayerId: room.turnManager!.getCurrentPlayerId(),
            round: room.turnManager!.getCurrentRound(),
            timeLimit: room.settings.drawTimeLimit,
          });
        }, ROLE_REVEAL_DURATION);

        return {};
      }

      case 'PLAY_AGAIN': {
        if (!playerId) {
          return {};
        }

        const roomCode = playerRooms.get(playerId);
        if (!roomCode) {
          send(playerId, { type: 'ERROR', message: 'You are not in a room' });
          return {};
        }

        const room = rooms.get(roomCode);
        if (!room) {
          send(playerId, { type: 'ERROR', message: 'Room not found' });
          return {};
        }

        const player = room.players.get(playerId);
        if (!player || !player.isHost) {
          send(playerId, { type: 'ERROR', message: 'Only the host can restart the game' });
          return {};
        }

        // Reset to lobby
        room.phase = 'LOBBY';
        room.strokes = [];
        room.turnManager = null;
        room.votingManager = null;

        // Reset player ready states
        for (const p of room.players.values()) {
          p.isReady = false;
          p.score = 0;
        }

        broadcast(roomCode, {
          type: 'RETURN_TO_LOBBY',
          players: room.getPlayerList(),
        });

        return {};
      }

      default:
        return {};
    }
  } catch (error: any) {
    if (playerId) {
      send(playerId, {
        type: 'ERROR',
        message: error.message || 'An error occurred',
      });
    }
    return {};
  }
}

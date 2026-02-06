import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { ClientGameState, initialGameState } from '../lib/gameState';
import { WS_URL } from '../lib/constants';
import type { GameSettings, Stroke, ServerMessage } from '../../../shared/types';

export function useGame() {
  const [state, setState] = useState<ClientGameState>(initialGameState);
  const { connected, send, connect, disconnect, onMessage } = useWebSocket();
  const stateRef = useRef(state);
  stateRef.current = state;

  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const notifyTurn = useCallback(() => {
    // Vibrate
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Browser notification (only fires when tab is not focused)
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification('Your turn!', {
        body: "It's your turn to draw!",
        tag: 'turn-notification',
      });
    }
  }, []);

  const handleMessage = useCallback((msg: ServerMessage) => {
    setState((prev) => {
      const s = { ...prev };

      switch (msg.type) {
        case 'GAME_CREATED':
          s.roomCode = msg.roomCode;
          s.playerId = msg.player.id;
          s.players = [msg.player];
          s.isHost = true;
          s.phase = 'LOBBY';
          s.error = null;
          break;

        case 'PLAYER_JOINED':
          s.playerId = s.playerId || msg.player.id;
          s.players = msg.players;
          s.phase = 'LOBBY';
          s.error = null;
          break;

        case 'PLAYER_LEFT':
          s.players = msg.players;
          if (s.playerId) {
            const me = msg.players.find(p => p.id === s.playerId);
            if (me) s.isHost = me.isHost;
          }
          break;

        case 'PLAYER_READY_UPDATE':
          s.players = msg.players;
          break;

        case 'GAME_STARTING':
          s.phase = 'ROLE_REVEAL';
          s.role = msg.role;
          s.secretWord = msg.word;
          s.turnOrder = msg.turnOrder;
          s.players = msg.players;
          s.winScore = msg.settings.winScore;
          s.drawTimeLimit = msg.settings.drawTimeLimit;
          s.strokes = [];
          s.currentRound = 1;
          s.error = null;
          break;

        case 'TURN_START':
          s.phase = 'DRAWING';
          s.activePlayerId = msg.activePlayerId;
          s.currentRound = msg.round;
          if (msg.activePlayerId === s.playerId) {
            notifyTurn();
          }
          break;

        case 'STROKE_BROADCAST':
          s.strokes = [...s.strokes, msg.stroke];
          break;

        case 'VOTING_START':
          s.phase = 'VOTING';
          s.players = msg.players;
          s.votedPlayerIds = [];
          break;

        case 'VOTE_CAST':
          s.votedPlayerIds = [...s.votedPlayerIds, msg.voterId];
          break;

        case 'VOTE_RESULT':
          break;

        case 'IMPOSTER_GUESS_PHASE':
          s.phase = 'IMPOSTER_GUESS';
          break;

        case 'TIMEOUT_UPDATE':
          s.timeoutPlayerIds = msg.timeoutPlayerIds;
          break;

        case 'ROUND_RESULT':
          s.phase = 'SCOREBOARD';
          s.roundResult = msg.result;
          s.timeoutPlayerIds = [];
          s.players = s.players.map(player => ({
            ...player,
            score: msg.result.totalScores[player.id] ?? player.score,
          }));
          break;

        case 'RETURN_TO_LOBBY':
          s.phase = 'LOBBY';
          s.players = msg.players;
          s.role = null;
          s.secretWord = null;
          s.turnOrder = [];
          s.activePlayerId = null;
          s.currentRound = 0;
          s.strokes = [];
          s.roundResult = null;
          break;

        case 'ERROR':
          s.error = msg.message;
          if (!s.playerId) {
            s.roomCode = null;
            s.phase = 'LOBBY';
          }
          break;
      }

      return s;
    });
  }, [notifyTurn]);

  useEffect(() => {
    onMessage(handleMessage);
  }, [onMessage, handleMessage]);

  const createGame = (name: string) => {
    requestNotificationPermission();
    connect(WS_URL);
    send({ type: 'CREATE_GAME', hostName: name });
  };

  const joinGame = (name: string, roomCode: string) => {
    requestNotificationPermission();
    setState(prev => ({ ...prev, roomCode: roomCode.toUpperCase() }));
    connect(WS_URL);
    send({ type: 'JOIN_GAME', roomCode, playerName: name });
  };

  const toggleReady = () => {
    send({ type: 'PLAYER_READY' });
  };

  const startGame = (settings: GameSettings) => {
    send({ type: 'START_GAME', settings });
  };

  const submitStroke = (stroke: Stroke) => {
    send({ type: 'SUBMIT_STROKE', stroke });
  };

  const submitVote = (votedPlayerId: string) => {
    send({ type: 'SUBMIT_VOTE', votedPlayerId });
  };

  const submitGuess = (word: string) => {
    send({ type: 'SUBMIT_GUESS', word });
  };

  const requestTimeout = () => {
    send({ type: 'REQUEST_TIMEOUT' });
  };

  const cancelTimeout = () => {
    send({ type: 'CANCEL_TIMEOUT' });
  };

  const nextRound = () => {
    send({ type: 'NEXT_ROUND' });
  };

  const playAgain = () => {
    send({ type: 'PLAY_AGAIN' });
  };

  return {
    state,
    connected,
    createGame,
    joinGame,
    toggleReady,
    startGame,
    submitStroke,
    submitVote,
    submitGuess,
    requestTimeout,
    cancelTimeout,
    nextRound,
    playAgain,
    disconnect,
  };
}

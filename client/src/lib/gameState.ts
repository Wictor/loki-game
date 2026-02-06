import { GamePhase, PlayerData, Stroke, Role, RoundResult } from '../../../shared/types';

export interface ClientGameState {
  roomCode: string | null;
  phase: GamePhase;
  playerId: string | null;
  players: PlayerData[];
  role: Role | null;
  secretWord: string | null;
  turnOrder: string[];
  activePlayerId: string | null;
  currentRound: number;
  strokes: Stroke[];
  roundResult: RoundResult | null;
  timeoutPlayerIds: string[];
  votedPlayerIds: string[];
  winScore: number;
  drawTimeLimit: number;
  isHost: boolean;
  error: string | null;
}

export const initialGameState: ClientGameState = {
  roomCode: null,
  phase: 'LOBBY',
  playerId: null,
  players: [],
  role: null,
  secretWord: null,
  turnOrder: [],
  activePlayerId: null,
  currentRound: 0,
  strokes: [],
  roundResult: null,
  timeoutPlayerIds: [],
  votedPlayerIds: [],
  winScore: 10,
  drawTimeLimit: 20,
  isHost: false,
  error: null,
};

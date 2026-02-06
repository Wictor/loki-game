// ---- Game Phases ----
export type GamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'DRAWING'
  | 'VOTING'
  | 'IMPOSTER_GUESS'
  | 'SCOREBOARD';

// ---- Player ----
export interface PlayerData {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
}

export type Role = 'artist' | 'imposter';

export interface RoleAssignment {
  playerId: string;
  role: Role;
  word: string | null; // null for imposter
}

// ---- Stroke ----
export interface Point {
  x: number; // normalized 0-1
  y: number; // normalized 0-1
}

export interface Stroke {
  playerId: string;
  color: string;
  points: Point[];
  brushSize: number;
  timestamp: number;
}

// ---- Game Settings ----
export interface GameSettings {
  category: string;
  customWord?: string;
  drawTimeLimit: number; // seconds per turn
  rounds: number;
  canvasMode: 'shared' | 'individual';
  winScore: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  category: 'random',
  drawTimeLimit: 20,
  rounds: 2,
  canvasMode: 'shared',
  winScore: 10,
};

// ---- Voting ----
export interface VoteResult {
  votes: Record<string, string>; // voterId -> votedForId
  caughtPlayerId: string | null; // null if tie
  isTie: boolean;
}

// ---- Scoring ----
export interface RoundResult {
  scores: Record<string, number>; // playerId -> points earned this round
  totalScores: Record<string, number>; // playerId -> cumulative
  imposterId: string;
  imposterCaught: boolean;
  imposterGuessCorrect: boolean | null; // null if not caught
  secretWord: string;
}

// ---- Game State ----
export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: PlayerData[];
  settings: GameSettings;
  currentRound: number;
  currentTurnIndex: number;
  turnOrder: string[]; // player IDs
  activePlayerId: string | null;
  strokes: Stroke[];
  roleAssignments?: RoleAssignment[]; // only on server
}

// ---- WebSocket Messages: Client → Server ----
export type ClientMessage =
  | { type: 'CREATE_GAME'; hostName: string }
  | { type: 'JOIN_GAME'; roomCode: string; playerName: string }
  | { type: 'PLAYER_READY' }
  | { type: 'START_GAME'; settings: GameSettings }
  | { type: 'SUBMIT_STROKE'; stroke: Stroke }
  | { type: 'SUBMIT_VOTE'; votedPlayerId: string }
  | { type: 'SUBMIT_GUESS'; word: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'REQUEST_TIMEOUT' }
  | { type: 'CANCEL_TIMEOUT' }
  | { type: 'PLAY_AGAIN' };

// ---- WebSocket Messages: Server → Client ----
export type ServerMessage =
  | { type: 'GAME_CREATED'; roomCode: string; player: PlayerData }
  | { type: 'PLAYER_JOINED'; player: PlayerData; players: PlayerData[] }
  | { type: 'PLAYER_LEFT'; playerId: string; players: PlayerData[] }
  | { type: 'PLAYER_READY_UPDATE'; playerId: string; isReady: boolean; players: PlayerData[] }
  | { type: 'GAME_STARTING'; role: Role; word: string | null; turnOrder: string[]; players: PlayerData[]; settings: GameSettings }
  | { type: 'TURN_START'; activePlayerId: string; round: number; timeLimit: number }
  | { type: 'STROKE_BROADCAST'; stroke: Stroke }
  | { type: 'TURN_TIMEOUT'; playerId: string }
  | { type: 'VOTING_START'; players: PlayerData[] }
  | { type: 'VOTE_CAST'; voterId: string }
  | { type: 'VOTE_RESULT'; votes: Record<string, string>; caughtPlayerId: string | null; isTie: boolean }
  | { type: 'IMPOSTER_GUESS_PHASE'; imposterId: string }
  | { type: 'ROUND_RESULT'; result: RoundResult }
  | { type: 'RETURN_TO_LOBBY'; players: PlayerData[] }
  | { type: 'TIMEOUT_UPDATE'; timeoutPlayerIds: string[] }
  | { type: 'ERROR'; message: string };

// ---- Constants ----
export const PLAYER_COLORS = [
  '#E74C3C', // red
  '#3498DB', // blue
  '#2ECC71', // green
  '#F39C12', // orange
  '#9B59B6', // purple
  '#1ABC9C', // teal
  '#E67E22', // dark orange
  '#34495E', // dark blue
];

export const ROLE_REVEAL_DURATION = 5000; // ms
export const VOTING_DURATION = 30000; // ms
export const IMPOSTER_GUESS_DURATION = 20000; // ms
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;
export const WIN_SCORE = 10;

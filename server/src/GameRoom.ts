import {
  GamePhase,
  GameSettings,
  DEFAULT_SETTINGS,
  Stroke,
  RoleAssignment,
  VoteResult,
  RoundResult,
  PlayerData,
  GameState,
  MIN_PLAYERS,
  MAX_PLAYERS,
} from '../../shared/types';
import { Player } from './Player';
import { WordBank } from './WordBank';
import { TurnManager } from './TurnManager';
import { VotingManager } from './VotingManager';
import { ScoringEngine } from './ScoringEngine';

export class GameRoom {
  public readonly roomCode: string;
  public phase: GamePhase;
  public players: Map<string, Player>;
  public settings: GameSettings;
  public strokes: Stroke[];
  public turnManager: TurnManager | null;
  public votingManager: VotingManager | null;
  public timeoutRequests: Set<string>;

  private wordBank: WordBank;
  public secretWord: string | null = null;
  public roleAssignments: RoleAssignment[] = [];
  private imposterGuessCorrect: boolean | null = null;
  private colorIndex: number = 0;

  constructor() {
    this.roomCode = GameRoom.generateRoomCode();
    this.phase = 'LOBBY';
    this.players = new Map();
    this.settings = { ...DEFAULT_SETTINGS };
    this.strokes = [];
    this.turnManager = null;
    this.votingManager = null;
    this.timeoutRequests = new Set();
    this.wordBank = new WordBank();
  }

  // ── Static helpers ────────────────────────────────────────────────────

  private static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ── Player management ─────────────────────────────────────────────────

  addPlayer(name: string, isHost: boolean = false): Player {
    if (this.phase !== 'LOBBY') {
      throw new Error('Can only join during LOBBY phase');
    }
    if (this.players.size >= MAX_PLAYERS) {
      throw new Error('Room is full');
    }

    const player = new Player(name, this.colorIndex++, isHost);
    this.players.set(player.id, player);
    return player;
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  togglePlayerReady(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.toggleReady();
    }
  }

  allPlayersReady(): boolean {
    if (this.players.size < MIN_PLAYERS) return false;
    for (const player of this.players.values()) {
      if (!player.isReady) return false;
    }
    return true;
  }

  // ── Game lifecycle ────────────────────────────────────────────────────

  startGame(settings?: GameSettings): void {
    if (this.players.size < MIN_PLAYERS) {
      throw new Error(`Need at least ${MIN_PLAYERS} players to start`);
    }

    for (const player of this.players.values()) {
      if (!player.isReady) {
        throw new Error('All players must be ready to start');
      }
    }

    if (settings) {
      this.settings = { ...settings };
    }

    // Pick the secret word
    if (this.settings.customWord) {
      this.secretWord = this.settings.customWord;
    } else {
      this.secretWord = this.wordBank.getRandomWord(this.settings.category);
    }

    // Create turn manager
    const playerIds = Array.from(this.players.keys());
    this.turnManager = new TurnManager(playerIds, this.settings.rounds);

    // Assign roles
    this.roleAssignments = this.assignRoles();

    // Reset strokes
    this.strokes = [];
    this.imposterGuessCorrect = null;

    this.phase = 'ROLE_REVEAL';
  }

  assignRoles(): RoleAssignment[] {
    const playerIds = Array.from(this.players.keys());
    const numImposters = playerIds.length >= 6 ? 2 : 1;

    // Shuffle to pick random imposters
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const imposterIds = new Set(shuffled.slice(0, numImposters));

    const assignments: RoleAssignment[] = playerIds.map((id) => {
      if (imposterIds.has(id)) {
        return { playerId: id, role: 'imposter', word: null };
      }
      return { playerId: id, role: 'artist', word: this.secretWord };
    });

    this.roleAssignments = assignments;
    return assignments;
  }

  startDrawing(): void {
    if (this.phase !== 'ROLE_REVEAL') {
      throw new Error('Can only start drawing from ROLE_REVEAL phase');
    }
    this.phase = 'DRAWING';
  }

  submitStroke(playerId: string, stroke: Stroke): void {
    if (this.phase !== 'DRAWING') {
      throw new Error('Can only submit strokes during DRAWING phase');
    }
    if (!this.turnManager) {
      throw new Error('Turn manager not initialized');
    }

    const activeId = this.turnManager.getCurrentPlayerId();
    if (playerId !== activeId) {
      throw new Error('Not your turn');
    }

    this.strokes.push(stroke);
    this.turnManager.advanceTurn();

    // Check if all turns are done
    if (this.turnManager.isComplete()) {
      this.startVoting();
    }
  }

  startVoting(): void {
    const playerIds = Array.from(this.players.keys());
    const imposterId = this.roleAssignments.find((r) => r.role === 'imposter')!.playerId;
    this.votingManager = new VotingManager(playerIds, imposterId);
    this.phase = 'VOTING';
  }

  submitVote(voterId: string, votedForId: string): void {
    if (!this.votingManager) {
      throw new Error('Voting has not started');
    }
    this.votingManager.castVote(voterId, votedForId);
  }

  allVotesIn(): boolean {
    if (!this.votingManager) return false;
    return this.votingManager.isComplete();
  }

  resolveVotes(): VoteResult {
    if (!this.votingManager) {
      throw new Error('Voting has not started');
    }
    return this.votingManager.getResult();
  }

  submitImposterGuess(word: string): boolean {
    if (!this.secretWord) {
      throw new Error('No secret word set');
    }
    const correct = word.toLowerCase() === this.secretWord.toLowerCase();
    this.imposterGuessCorrect = correct;
    return correct;
  }

  calculateScores(): RoundResult {
    if (!this.votingManager) {
      throw new Error('Voting has not started');
    }

    const voteResult = this.votingManager.getResult();
    const imposterCaught = this.votingManager.isCaughtPlayerImposter();
    const imposterId = this.roleAssignments.find((r) => r.role === 'imposter')!.playerId;
    const artistIds = this.roleAssignments
      .filter((r) => r.role === 'artist')
      .map((r) => r.playerId);

    const roundScores = ScoringEngine.calculate({
      votes: voteResult.votes,
      imposterId,
      artistIds,
      imposterCaught,
      imposterGuessCorrect: imposterCaught ? this.imposterGuessCorrect : null,
    });

    // Apply scores to player objects
    for (const [id, points] of Object.entries(roundScores)) {
      const player = this.players.get(id);
      if (player) {
        player.addPoints(points);
      }
    }

    // Build total scores
    const totalScores: Record<string, number> = {};
    this.players.forEach((player, id) => {
      totalScores[id] = player.score;
    });

    return {
      scores: roundScores,
      totalScores,
      imposterId,
      imposterCaught,
      imposterGuessCorrect: imposterCaught ? this.imposterGuessCorrect : null,
      secretWord: this.secretWord!,
    };
  }

  // ── Serialization ─────────────────────────────────────────────────────

  getState(): GameState {
    return {
      roomCode: this.roomCode,
      phase: this.phase,
      players: this.getPlayerList(),
      settings: this.settings,
      currentRound: this.turnManager?.getCurrentRound() ?? 0,
      currentTurnIndex: this.turnManager?.getTurnIndex() ?? 0,
      turnOrder: this.turnManager?.getTurnOrder() ?? [],
      activePlayerId: this.turnManager?.getCurrentPlayerId() ?? null,
      strokes: this.strokes,
    };
  }

  getPlayerList(): PlayerData[] {
    return Array.from(this.players.values()).map((p) => p.toData());
  }

  getRoleForPlayer(playerId: string): RoleAssignment {
    const assignment = this.roleAssignments.find((r) => r.playerId === playerId);
    if (!assignment) {
      throw new Error(`No role assignment found for player ${playerId}`);
    }
    return assignment;
  }
}

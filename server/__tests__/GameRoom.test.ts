import { describe, it, expect, beforeEach } from 'vitest';
import { GameRoom } from '../src/GameRoom';
import { GameSettings, DEFAULT_SETTINGS, Stroke } from '../../shared/types';

describe('GameRoom', () => {
  let room: GameRoom;

  beforeEach(() => {
    room = new GameRoom();
  });

  // ── Room code generation ──────────────────────────────────────────────
  describe('constructor / room code', () => {
    it('should generate a 4-letter uppercase room code', () => {
      expect(room.roomCode).toMatch(/^[A-Z]{4}$/);
    });

    it('should start in LOBBY phase', () => {
      expect(room.phase).toBe('LOBBY');
    });

    it('should start with no players', () => {
      expect(room.players.size).toBe(0);
    });

    it('should start with default settings', () => {
      expect(room.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should start with empty strokes', () => {
      expect(room.strokes).toEqual([]);
    });

    it('should start with null turnManager and votingManager', () => {
      expect(room.turnManager).toBeNull();
      expect(room.votingManager).toBeNull();
    });

    it('should generate unique codes across instances', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 20; i++) {
        codes.add(new GameRoom().roomCode);
      }
      // With 26^4 = 456976 possibilities, 20 codes should all be unique
      expect(codes.size).toBe(20);
    });
  });

  // ── Player join / leave ───────────────────────────────────────────────
  describe('addPlayer', () => {
    it('should add a player and return it', () => {
      const player = room.addPlayer('Alice', true);
      expect(player.name).toBe('Alice');
      expect(player.isHost).toBe(true);
      expect(room.players.size).toBe(1);
      expect(room.players.get(player.id)).toBe(player);
    });

    it('should add non-host player by default', () => {
      const player = room.addPlayer('Bob');
      expect(player.isHost).toBe(false);
    });

    it('should assign sequential colors', () => {
      const p1 = room.addPlayer('Alice');
      const p2 = room.addPlayer('Bob');
      expect(p1.color).not.toBe(p2.color);
    });

    it('should throw when game is not in LOBBY phase', () => {
      // Add 3 players and start game to leave LOBBY
      room.addPlayer('A', true);
      room.addPlayer('B');
      room.addPlayer('C');
      room.players.forEach((p) => (p.isReady = true));
      room.startGame();
      expect(() => room.addPlayer('Late')).toThrow(/lobby/i);
    });

    it('should throw when room is full (8 players)', () => {
      for (let i = 0; i < 8; i++) {
        room.addPlayer(`P${i}`);
      }
      expect(() => room.addPlayer('Overflow')).toThrow(/full/i);
    });
  });

  describe('removePlayer', () => {
    it('should remove an existing player', () => {
      const p = room.addPlayer('Alice');
      room.removePlayer(p.id);
      expect(room.players.size).toBe(0);
    });

    it('should be a no-op for unknown player id', () => {
      room.addPlayer('Alice');
      room.removePlayer('nonexistent');
      expect(room.players.size).toBe(1);
    });
  });

  // ── Ready system ──────────────────────────────────────────────────────
  describe('togglePlayerReady / allPlayersReady', () => {
    it('should toggle player ready state', () => {
      const p = room.addPlayer('Alice');
      expect(p.isReady).toBe(false);
      room.togglePlayerReady(p.id);
      expect(p.isReady).toBe(true);
      room.togglePlayerReady(p.id);
      expect(p.isReady).toBe(false);
    });

    it('allPlayersReady returns false with fewer than 3 players', () => {
      const p1 = room.addPlayer('A');
      const p2 = room.addPlayer('B');
      p1.isReady = true;
      p2.isReady = true;
      expect(room.allPlayersReady()).toBe(false);
    });

    it('allPlayersReady returns false when not all ready', () => {
      room.addPlayer('A').isReady = true;
      room.addPlayer('B').isReady = true;
      room.addPlayer('C'); // not ready
      expect(room.allPlayersReady()).toBe(false);
    });

    it('allPlayersReady returns true with 3+ players all ready', () => {
      for (let i = 0; i < 3; i++) {
        room.addPlayer(`P${i}`).isReady = true;
      }
      expect(room.allPlayersReady()).toBe(true);
    });
  });

  // ── Start game ────────────────────────────────────────────────────────
  describe('startGame', () => {
    function addReadyPlayers(n: number) {
      for (let i = 0; i < n; i++) {
        room.addPlayer(`P${i}`, i === 0).isReady = true;
      }
    }

    it('should throw with fewer than 3 players', () => {
      room.addPlayer('A').isReady = true;
      room.addPlayer('B').isReady = true;
      expect(() => room.startGame()).toThrow(/3/);
    });

    it('should throw when not all players are ready', () => {
      room.addPlayer('A').isReady = true;
      room.addPlayer('B').isReady = true;
      room.addPlayer('C'); // not ready
      expect(() => room.startGame()).toThrow(/ready/i);
    });

    it('should transition to ROLE_REVEAL on success', () => {
      addReadyPlayers(3);
      room.startGame();
      expect(room.phase).toBe('ROLE_REVEAL');
    });

    it('should create turnManager', () => {
      addReadyPlayers(3);
      room.startGame();
      expect(room.turnManager).not.toBeNull();
    });

    it('should accept custom settings', () => {
      addReadyPlayers(3);
      const settings: GameSettings = {
        category: 'food',
        drawTimeLimit: 30,
        rounds: 3,
        canvasMode: 'individual',
        winScore: 10,
      };
      room.startGame(settings);
      expect(room.settings).toEqual(settings);
    });

    it('should use custom word when provided', () => {
      addReadyPlayers(3);
      room.startGame({ ...DEFAULT_SETTINGS, customWord: 'unicorn' });
      const roles = room.assignRoles();
      const artistRole = roles.find((r) => r.role === 'artist');
      expect(artistRole?.word).toBe('unicorn');
    });
  });

  // ── Role assignment ───────────────────────────────────────────────────
  describe('assignRoles', () => {
    it('should assign 1 imposter for 3 players', () => {
      for (let i = 0; i < 3; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      const imposters = roles.filter((r) => r.role === 'imposter');
      const artists = roles.filter((r) => r.role === 'artist');
      expect(imposters.length).toBe(1);
      expect(artists.length).toBe(2);
    });

    it('should assign 1 imposter for 5 players', () => {
      for (let i = 0; i < 5; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      expect(roles.filter((r) => r.role === 'imposter').length).toBe(1);
    });

    it('should assign 2 imposters for 6 players', () => {
      for (let i = 0; i < 6; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      expect(roles.filter((r) => r.role === 'imposter').length).toBe(2);
    });

    it('should assign 2 imposters for 8 players', () => {
      for (let i = 0; i < 8; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      expect(roles.filter((r) => r.role === 'imposter').length).toBe(2);
    });

    it('imposter should have word=null, artists should have the word', () => {
      for (let i = 0; i < 4; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      const imposter = roles.find((r) => r.role === 'imposter')!;
      const artist = roles.find((r) => r.role === 'artist')!;
      expect(imposter.word).toBeNull();
      expect(artist.word).toBeTruthy();
    });

    it('all artists should get the same word', () => {
      for (let i = 0; i < 5; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      const artistWords = roles.filter((r) => r.role === 'artist').map((r) => r.word);
      expect(new Set(artistWords).size).toBe(1);
    });
  });

  // ── State machine transitions ─────────────────────────────────────────
  describe('phase transitions', () => {
    function setupRunningGame() {
      for (let i = 0; i < 4; i++) room.addPlayer(`P${i}`, i === 0).isReady = true;
      room.startGame();
    }

    it('LOBBY -> ROLE_REVEAL via startGame', () => {
      setupRunningGame();
      expect(room.phase).toBe('ROLE_REVEAL');
    });

    it('ROLE_REVEAL -> DRAWING via startDrawing', () => {
      setupRunningGame();
      room.startDrawing();
      expect(room.phase).toBe('DRAWING');
    });

    it('startDrawing throws if not in ROLE_REVEAL', () => {
      expect(() => room.startDrawing()).toThrow();
    });

    it('DRAWING -> VOTING via startVoting', () => {
      setupRunningGame();
      room.startDrawing();
      room.startVoting();
      expect(room.phase).toBe('VOTING');
    });

    it('startVoting creates a VotingManager', () => {
      setupRunningGame();
      room.startDrawing();
      room.startVoting();
      expect(room.votingManager).not.toBeNull();
    });
  });

  // ── Turn management integration ───────────────────────────────────────
  describe('submitStroke', () => {
    function setupDrawingPhase() {
      for (let i = 0; i < 3; i++) room.addPlayer(`P${i}`, i === 0).isReady = true;
      room.startGame();
      room.startDrawing();
    }

    it('should accept a stroke from the active player', () => {
      setupDrawingPhase();
      const activeId = room.turnManager!.getCurrentPlayerId();
      const stroke: Stroke = {
        playerId: activeId,
        color: '#000',
        points: [{ x: 0, y: 0 }],
        brushSize: 3,
        timestamp: Date.now(),
      };
      room.submitStroke(activeId, stroke);
      expect(room.strokes.length).toBe(1);
    });

    it('should throw when non-active player submits stroke', () => {
      setupDrawingPhase();
      const activeId = room.turnManager!.getCurrentPlayerId();
      const otherIds = Array.from(room.players.keys()).filter((id) => id !== activeId);
      const stroke: Stroke = {
        playerId: otherIds[0],
        color: '#000',
        points: [{ x: 0, y: 0 }],
        brushSize: 3,
        timestamp: Date.now(),
      };
      expect(() => room.submitStroke(otherIds[0], stroke)).toThrow(/turn/i);
    });

    it('should advance turn after submitting stroke', () => {
      setupDrawingPhase();
      const firstActiveId = room.turnManager!.getCurrentPlayerId();
      const stroke: Stroke = {
        playerId: firstActiveId,
        color: '#000',
        points: [{ x: 0, y: 0 }],
        brushSize: 3,
        timestamp: Date.now(),
      };
      room.submitStroke(firstActiveId, stroke);
      const nextActiveId = room.turnManager!.getCurrentPlayerId();
      expect(nextActiveId).not.toBe(firstActiveId);
    });

    it('should transition to VOTING when all turns complete', () => {
      setupDrawingPhase();
      const tm = room.turnManager!;
      const totalRounds = room.settings.rounds;
      const totalTurns = room.players.size * totalRounds;

      for (let t = 0; t < totalTurns; t++) {
        const activeId = tm.getCurrentPlayerId();
        const stroke: Stroke = {
          playerId: activeId,
          color: '#000',
          points: [{ x: 0, y: 0 }],
          brushSize: 3,
          timestamp: Date.now(),
        };
        room.submitStroke(activeId, stroke);
      }

      expect(room.phase).toBe('VOTING');
    });
  });

  // ── Voting integration ────────────────────────────────────────────────
  describe('voting', () => {
    function setupVotingPhase() {
      for (let i = 0; i < 4; i++) room.addPlayer(`P${i}`, i === 0).isReady = true;
      room.startGame();
      room.startDrawing();
      room.startVoting();
    }

    it('submitVote should delegate to VotingManager', () => {
      setupVotingPhase();
      const ids = Array.from(room.players.keys());
      room.submitVote(ids[0], ids[1]);
      expect(room.votingManager!.getVoteCount()).toBe(1);
    });

    it('allVotesIn should reflect VotingManager completion', () => {
      setupVotingPhase();
      const ids = Array.from(room.players.keys());
      expect(room.allVotesIn()).toBe(false);
      // Everyone votes for the second player
      ids.forEach((id, i) => {
        const target = ids[(i + 1) % ids.length];
        room.submitVote(id, target);
      });
      expect(room.allVotesIn()).toBe(true);
    });

    it('resolveVotes should return VoteResult', () => {
      setupVotingPhase();
      const ids = Array.from(room.players.keys());
      // All vote for second player
      ids.forEach((id) => {
        if (id !== ids[1]) room.submitVote(id, ids[1]);
        else room.submitVote(id, ids[0]);
      });
      const result = room.resolveVotes();
      expect(result).toHaveProperty('votes');
      expect(result).toHaveProperty('caughtPlayerId');
      expect(result).toHaveProperty('isTie');
    });
  });

  // ── Imposter guess ────────────────────────────────────────────────────
  describe('submitImposterGuess', () => {
    it('should return true when imposter guesses correct word', () => {
      for (let i = 0; i < 3; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      // Find the secret word from role assignments
      const roles = room.assignRoles();
      const artistRole = roles.find((r) => r.role === 'artist')!;
      const word = artistRole.word!;
      expect(room.submitImposterGuess(word)).toBe(true);
    });

    it('should return true case-insensitively', () => {
      for (let i = 0; i < 3; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      const artistRole = roles.find((r) => r.role === 'artist')!;
      const word = artistRole.word!;
      expect(room.submitImposterGuess(word.toUpperCase())).toBe(true);
    });

    it('should return false for wrong guess', () => {
      for (let i = 0; i < 3; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      expect(room.submitImposterGuess('xyznotaword')).toBe(false);
    });
  });

  // ── Scoring integration ───────────────────────────────────────────────
  describe('calculateScores', () => {
    function setupForScoring() {
      for (let i = 0; i < 4; i++) room.addPlayer(`P${i}`, i === 0).isReady = true;
      room.startGame();
      room.startDrawing();
      room.startVoting();

      // Use the roles assigned by startGame (don't re-assign!)
      const roles = room.roleAssignments;
      const imposterId = roles.find((r) => r.role === 'imposter')!.playerId;
      const artistIds = roles.filter((r) => r.role === 'artist').map((r) => r.playerId);
      const ids = Array.from(room.players.keys());

      // Everyone votes for the imposter (except imposter votes for first artist)
      ids.forEach((id) => {
        if (id === imposterId) {
          room.submitVote(id, artistIds[0]);
        } else {
          room.submitVote(id, imposterId);
        }
      });

      return { imposterId, artistIds, roles };
    }

    it('should return a RoundResult with scores', () => {
      const { imposterId } = setupForScoring();
      const result = room.calculateScores();
      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('totalScores');
      expect(result).toHaveProperty('imposterId', imposterId);
      expect(result).toHaveProperty('imposterCaught');
      expect(result).toHaveProperty('secretWord');
    });

    it('artists who voted for imposter get +1', () => {
      const { imposterId, artistIds } = setupForScoring();
      const result = room.calculateScores();
      artistIds.forEach((id) => {
        expect(result.scores[id]).toBe(1);
      });
    });

    it('should accumulate total scores on Player objects', () => {
      const { artistIds } = setupForScoring();
      room.calculateScores();
      artistIds.forEach((id) => {
        expect(room.players.get(id)!.score).toBe(1);
      });
    });
  });

  // ── getState / getPlayerList / getRoleForPlayer ───────────────────────
  describe('getState', () => {
    it('should return serializable game state', () => {
      room.addPlayer('Alice', true);
      room.addPlayer('Bob');
      const state = room.getState();
      expect(state).toHaveProperty('roomCode', room.roomCode);
      expect(state).toHaveProperty('phase', 'LOBBY');
      expect(state).toHaveProperty('players');
      expect(state).toHaveProperty('settings');
      expect((state as any).players.length).toBe(2);
    });
  });

  describe('getPlayerList', () => {
    it('should return PlayerData[] for all players', () => {
      room.addPlayer('Alice', true);
      room.addPlayer('Bob');
      const list = room.getPlayerList();
      expect(list.length).toBe(2);
      expect(list[0]).toHaveProperty('id');
      expect(list[0]).toHaveProperty('name');
      expect(list[0]).toHaveProperty('color');
      expect(list[0]).toHaveProperty('isHost');
      expect(list[0]).toHaveProperty('isReady');
      expect(list[0]).toHaveProperty('score');
    });
  });

  describe('getRoleForPlayer', () => {
    it('should return role assignment for a player after game starts', () => {
      for (let i = 0; i < 3; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      const roles = room.assignRoles();
      const playerId = roles[0].playerId;
      const role = room.getRoleForPlayer(playerId);
      expect(role).toHaveProperty('playerId', playerId);
      expect(role).toHaveProperty('role');
      expect(['artist', 'imposter']).toContain(role.role);
    });

    it('should throw for unknown player', () => {
      for (let i = 0; i < 3; i++) room.addPlayer(`P${i}`).isReady = true;
      room.startGame();
      room.assignRoles();
      expect(() => room.getRoleForPlayer('unknown')).toThrow();
    });
  });

  // ── Full game flow (pure logic, no WS) ────────────────────────────────
  describe('full game flow', () => {
    it('should play through a complete game cycle', () => {
      // 1. LOBBY: add players
      const p1 = room.addPlayer('Alice', true);
      const p2 = room.addPlayer('Bob');
      const p3 = room.addPlayer('Charlie');
      const p4 = room.addPlayer('Diana');

      expect(room.phase).toBe('LOBBY');

      // 2. Ready up
      [p1, p2, p3, p4].forEach((p) => room.togglePlayerReady(p.id));
      expect(room.allPlayersReady()).toBe(true);

      // 3. Start game -> ROLE_REVEAL
      room.startGame({ ...DEFAULT_SETTINGS, rounds: 1 });
      expect(room.phase).toBe('ROLE_REVEAL');
      expect(room.turnManager).not.toBeNull();

      // 4. Check roles
      const roles = room.assignRoles();
      const imposter = roles.find((r) => r.role === 'imposter')!;
      const artists = roles.filter((r) => r.role === 'artist');
      expect(imposter).toBeDefined();
      expect(imposter.word).toBeNull();
      expect(artists.length).toBe(3);
      const secretWord = artists[0].word!;
      expect(secretWord).toBeTruthy();

      // 5. ROLE_REVEAL -> DRAWING
      room.startDrawing();
      expect(room.phase).toBe('DRAWING');

      // 6. Each player draws (1 round * 4 players = 4 turns)
      const tm = room.turnManager!;
      for (let t = 0; t < 4; t++) {
        const activeId = tm.getCurrentPlayerId();
        room.submitStroke(activeId, {
          playerId: activeId,
          color: '#000',
          points: [
            { x: 0.1, y: 0.1 },
            { x: 0.5, y: 0.5 },
          ],
          brushSize: 3,
          timestamp: Date.now(),
        });
      }

      // After all turns complete, phase should be VOTING
      expect(room.phase).toBe('VOTING');
      expect(room.strokes.length).toBe(4);

      // 7. VOTING: everyone votes for imposter (except imposter)
      const playerIds = Array.from(room.players.keys());
      playerIds.forEach((id) => {
        if (id === imposter.playerId) {
          // imposter votes for first artist
          room.submitVote(id, artists[0].playerId);
        } else {
          room.submitVote(id, imposter.playerId);
        }
      });
      expect(room.allVotesIn()).toBe(true);

      // 8. Resolve votes
      const voteResult = room.resolveVotes();
      expect(voteResult.caughtPlayerId).toBe(imposter.playerId);
      expect(voteResult.isTie).toBe(false);

      // 9. Imposter guess phase
      const guessCorrect = room.submitImposterGuess(secretWord);
      expect(guessCorrect).toBe(true);

      // 10. Calculate scores
      const roundResult = room.calculateScores();
      expect(roundResult.imposterId).toBe(imposter.playerId);
      expect(roundResult.imposterCaught).toBe(true);
      expect(roundResult.imposterGuessCorrect).toBe(true);
      expect(roundResult.secretWord).toBe(secretWord);

      // Imposter caught but guessed word correctly: artists get 0
      artists.forEach((a) => {
        expect(roundResult.scores[a.playerId]).toBe(0);
      });

      // Imposter caught but guessed word: +1
      expect(roundResult.scores[imposter.playerId]).toBe(1);

      // Total scores should match
      Object.entries(roundResult.scores).forEach(([id, pts]) => {
        expect(roundResult.totalScores[id]).toBe(pts);
      });
    });
  });
});

import { TurnManager } from '../src/TurnManager';

describe('TurnManager', () => {
  describe('initialization', () => {
    it('should initialize with provided player IDs', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const tm = new TurnManager(playerIds);
      const order = tm.getTurnOrder();
      expect(order).toHaveLength(3);
      expect(order).toEqual(expect.arrayContaining(playerIds));
    });

    it('should start at round 1', () => {
      const tm = new TurnManager(['p1', 'p2']);
      expect(tm.getCurrentRound()).toBe(1);
    });

    it('should set first player in shuffled order as current', () => {
      const tm = new TurnManager(['p1', 'p2', 'p3']);
      expect(tm.getCurrentPlayerId()).toBe(tm.getTurnOrder()[0]);
    });

    it('should default to 2 rounds', () => {
      const tm = new TurnManager(['p1', 'p2']);
      // 2 players × 2 rounds = 4 advances to complete
      for (let i = 0; i < 4; i++) tm.advanceTurn();
      expect(tm.isComplete()).toBe(true);
    });

    it('should accept custom number of rounds', () => {
      const tm = new TurnManager(['p1', 'p2'], 3);
      for (let i = 0; i < 4; i++) tm.advanceTurn();
      expect(tm.isComplete()).toBe(false); // still round 3 left
    });
  });

  describe('shuffling', () => {
    it('should shuffle turn order (not always same as input)', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
      let wasShuffled = false;
      for (let i = 0; i < 100; i++) {
        const tm = new TurnManager([...playerIds]);
        const order = tm.getTurnOrder();
        if (playerIds.some((id, idx) => id !== order[idx])) {
          wasShuffled = true;
          break;
        }
      }
      expect(wasShuffled).toBe(true);
    });

    it('should contain all original players after shuffle', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4'];
      const tm = new TurnManager(playerIds);
      expect(tm.getTurnOrder().sort()).toEqual([...playerIds].sort());
    });
  });

  describe('turn advancement', () => {
    it('should advance through players in order', () => {
      const tm = new TurnManager(['p1', 'p2', 'p3']);
      const order = tm.getTurnOrder();

      expect(tm.getCurrentPlayerId()).toBe(order[0]);
      tm.advanceTurn();
      expect(tm.getCurrentPlayerId()).toBe(order[1]);
      tm.advanceTurn();
      expect(tm.getCurrentPlayerId()).toBe(order[2]);
    });

    it('should advance to round 2 after all players go', () => {
      const tm = new TurnManager(['p1', 'p2', 'p3']);
      const order = tm.getTurnOrder();

      tm.advanceTurn(); // -> order[1]
      tm.advanceTurn(); // -> order[2]
      tm.advanceTurn(); // -> round 2, order[0]

      expect(tm.getCurrentRound()).toBe(2);
      expect(tm.getCurrentPlayerId()).toBe(order[0]);
    });

    it('should use same turn order in round 2', () => {
      const tm = new TurnManager(['p1', 'p2', 'p3']);
      const order = tm.getTurnOrder();

      const round1: string[] = [];
      for (let i = 0; i < 3; i++) {
        round1.push(tm.getCurrentPlayerId());
        tm.advanceTurn();
      }

      const round2: string[] = [];
      for (let i = 0; i < 3; i++) {
        round2.push(tm.getCurrentPlayerId());
        tm.advanceTurn();
      }

      expect(round2).toEqual(round1);
    });

    it('should track turn index correctly', () => {
      const tm = new TurnManager(['p1', 'p2', 'p3']);
      expect(tm.getTurnIndex()).toBe(0);
      tm.advanceTurn();
      expect(tm.getTurnIndex()).toBe(1);
      tm.advanceTurn();
      expect(tm.getTurnIndex()).toBe(2);
      tm.advanceTurn();
      expect(tm.getTurnIndex()).toBe(0); // wrapped to round 2
    });
  });

  describe('completion', () => {
    it('should not be complete initially', () => {
      const tm = new TurnManager(['p1', 'p2'], 2);
      expect(tm.isComplete()).toBe(false);
    });

    it('should complete after all rounds (3 players × 2 rounds = 6 turns)', () => {
      const tm = new TurnManager(['p1', 'p2', 'p3'], 2);
      for (let i = 0; i < 6; i++) {
        expect(tm.isComplete()).toBe(false);
        tm.advanceTurn();
      }
      expect(tm.isComplete()).toBe(true);
    });

    it('should handle single round', () => {
      const tm = new TurnManager(['p1', 'p2'], 1);
      tm.advanceTurn();
      expect(tm.isComplete()).toBe(false);
      tm.advanceTurn();
      expect(tm.isComplete()).toBe(true);
    });
  });

  describe('different player counts', () => {
    [3, 5, 8].forEach(count => {
      it(`should work with ${count} players`, () => {
        const ids = Array.from({ length: count }, (_, i) => `p${i + 1}`);
        const tm = new TurnManager(ids, 2);
        expect(tm.getTurnOrder()).toHaveLength(count);

        const totalTurns = count * 2;
        for (let i = 0; i < totalTurns; i++) {
          expect(tm.isComplete()).toBe(false);
          tm.advanceTurn();
        }
        expect(tm.isComplete()).toBe(true);
      });
    });
  });

  describe('round tracking', () => {
    it('should track rounds correctly through game', () => {
      const tm = new TurnManager(['p1', 'p2'], 3);
      expect(tm.getRound()).toBe(1);
      tm.advanceTurn();
      tm.advanceTurn();
      expect(tm.getRound()).toBe(2);
      tm.advanceTurn();
      tm.advanceTurn();
      expect(tm.getRound()).toBe(3);
    });
  });
});

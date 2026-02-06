import { VotingManager } from '../src/VotingManager';

describe('VotingManager', () => {
  const playerIds = ['p1', 'p2', 'p3', 'p4'];
  const imposterId = 'p2';

  describe('initialization', () => {
    it('should create with player IDs and imposter ID', () => {
      const vm = new VotingManager(playerIds, imposterId);
      expect(vm).toBeDefined();
    });

    it('should start with no votes', () => {
      const vm = new VotingManager(playerIds, imposterId);
      expect(vm.getVoteCount()).toBe(0);
    });

    it('should not be complete initially', () => {
      const vm = new VotingManager(playerIds, imposterId);
      expect(vm.isComplete()).toBe(false);
    });
  });

  describe('vote collection', () => {
    it('should accept a valid vote', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p3');
      expect(vm.getVoteCount()).toBe(1);
    });

    it('should collect votes from multiple players', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p3');
      vm.castVote('p2', 'p3');
      vm.castVote('p3', 'p2');
      vm.castVote('p4', 'p2');
      expect(vm.getVoteCount()).toBe(4);
    });

    it('should not allow self-voting', () => {
      const vm = new VotingManager(playerIds, imposterId);
      expect(() => vm.castVote('p1', 'p1')).toThrow(/self/i);
    });

    it('should not allow duplicate votes from same player', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p3');
      expect(() => vm.castVote('p1', 'p4')).toThrow(/already voted/i);
    });

    it('should not allow votes from non-players', () => {
      const vm = new VotingManager(playerIds, imposterId);
      expect(() => vm.castVote('unknown', 'p1')).toThrow();
    });

    it('should not allow votes for non-players', () => {
      const vm = new VotingManager(playerIds, imposterId);
      expect(() => vm.castVote('p1', 'unknown')).toThrow();
    });
  });

  describe('completion', () => {
    it('should be complete when all players have voted', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p3');
      vm.castVote('p2', 'p3');
      vm.castVote('p3', 'p2');
      vm.castVote('p4', 'p2');
      expect(vm.isComplete()).toBe(true);
    });

    it('should not be complete with partial votes', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p3');
      vm.castVote('p2', 'p3');
      expect(vm.isComplete()).toBe(false);
    });
  });

  describe('result calculation', () => {
    it('should find player with most votes', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p2');
      vm.castVote('p3', 'p2');
      vm.castVote('p4', 'p2');
      vm.castVote('p2', 'p1');
      const result = vm.getResult();
      expect(result.caughtPlayerId).toBe('p2');
      expect(result.isTie).toBe(false);
    });

    it('should handle tie (no one caught)', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p2');
      vm.castVote('p2', 'p1');
      vm.castVote('p3', 'p4');
      vm.castVote('p4', 'p3');
      const result = vm.getResult();
      expect(result.caughtPlayerId).toBeNull();
      expect(result.isTie).toBe(true);
    });

    it('should return all votes in result', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p2');
      vm.castVote('p2', 'p3');
      vm.castVote('p3', 'p2');
      vm.castVote('p4', 'p2');
      const result = vm.getResult();
      expect(result.votes).toEqual({
        p1: 'p2',
        p2: 'p3',
        p3: 'p2',
        p4: 'p2',
      });
    });

    it('should resolve simple majority', () => {
      const ids = ['p1', 'p2', 'p3'];
      const vm = new VotingManager(ids, 'p2');
      vm.castVote('p1', 'p2');
      vm.castVote('p2', 'p3');
      vm.castVote('p3', 'p2');
      const result = vm.getResult();
      expect(result.caughtPlayerId).toBe('p2');
    });
  });

  describe('imposter check', () => {
    it('should correctly identify when caught player is the imposter', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p2');
      vm.castVote('p3', 'p2');
      vm.castVote('p4', 'p2');
      vm.castVote('p2', 'p1');
      const result = vm.getResult();
      expect(vm.isCaughtPlayerImposter()).toBe(true);
    });

    it('should correctly identify when caught player is NOT the imposter', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p3');
      vm.castVote('p2', 'p3');
      vm.castVote('p4', 'p3');
      vm.castVote('p3', 'p2');
      const result = vm.getResult();
      expect(vm.isCaughtPlayerImposter()).toBe(false);
    });

    it('should return false for imposter check on tie', () => {
      const vm = new VotingManager(playerIds, imposterId);
      vm.castVote('p1', 'p2');
      vm.castVote('p2', 'p1');
      vm.castVote('p3', 'p4');
      vm.castVote('p4', 'p3');
      const result = vm.getResult();
      expect(vm.isCaughtPlayerImposter()).toBe(false);
    });
  });
});

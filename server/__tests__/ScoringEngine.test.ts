import { ScoringEngine } from '../src/ScoringEngine';

describe('ScoringEngine', () => {
  // Players: p1(artist), p2(imposter), p3(artist), p4(artist)
  const artistIds = ['p1', 'p3', 'p4'];
  const imposterId = 'p2';

  describe('imposter escapes (+2 for imposter)', () => {
    it('should award +2 to imposter when not caught', () => {
      const votes = { p1: 'p3', p3: 'p4', p4: 'p3', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: false,
        imposterGuessCorrect: null,
      });
      expect(scores['p2']).toBe(2);
    });

    it('should give 0 to all non-imposters when imposter escapes', () => {
      const votes = { p1: 'p3', p3: 'p4', p4: 'p3', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: false,
        imposterGuessCorrect: null,
      });
      expect(scores['p1']).toBe(0);
      expect(scores['p3']).toBe(0);
      expect(scores['p4']).toBe(0);
    });
  });

  describe('imposter caught, wrong guess', () => {
    it('should award +1 to each non-imposter who voted correctly', () => {
      const votes = { p1: 'p2', p3: 'p2', p4: 'p2', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: true,
        imposterGuessCorrect: false,
      });
      expect(scores['p1']).toBe(1);
      expect(scores['p3']).toBe(1);
      expect(scores['p4']).toBe(1);
    });

    it('should award 0 to non-imposters who voted wrong', () => {
      const votes = { p1: 'p2', p3: 'p4', p4: 'p3', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: true,
        imposterGuessCorrect: false,
      });
      expect(scores['p1']).toBe(1); // voted correctly
      expect(scores['p3']).toBe(0); // voted wrong
      expect(scores['p4']).toBe(0); // voted wrong
    });

    it('should award 0 to imposter', () => {
      const votes = { p1: 'p2', p3: 'p2', p4: 'p2', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: true,
        imposterGuessCorrect: false,
      });
      expect(scores['p2']).toBe(0);
    });
  });

  describe('imposter caught, correct guess (+1 for imposter, 0 for everyone else)', () => {
    it('should award +1 to imposter who guesses correctly', () => {
      const votes = { p1: 'p2', p3: 'p2', p4: 'p2', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: true,
        imposterGuessCorrect: true,
      });
      expect(scores['p2']).toBe(1);
    });

    it('should award 0 to all non-imposters even if they voted correctly', () => {
      const votes = { p1: 'p2', p3: 'p2', p4: 'p2', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: true,
        imposterGuessCorrect: true,
      });
      expect(scores['p1']).toBe(0);
      expect(scores['p3']).toBe(0);
      expect(scores['p4']).toBe(0);
    });
  });

  describe('all player IDs present in result', () => {
    it('should include all players in score result', () => {
      const votes = { p1: 'p2', p3: 'p2', p4: 'p2', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: true,
        imposterGuessCorrect: false,
      });
      expect(Object.keys(scores)).toContain('p1');
      expect(Object.keys(scores)).toContain('p2');
      expect(Object.keys(scores)).toContain('p3');
      expect(Object.keys(scores)).toContain('p4');
    });
  });

  describe('edge cases', () => {
    it('should handle 3-player game (minimum)', () => {
      const votes = { p1: 'p2', p2: 'p3', p3: 'p2' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId: 'p2',
        artistIds: ['p1', 'p3'],
        imposterCaught: true,
        imposterGuessCorrect: false,
      });
      expect(scores['p1']).toBe(1); // voted correctly
      expect(scores['p3']).toBe(1); // voted correctly
      expect(scores['p2']).toBe(0); // caught, wrong guess
    });

    it('should handle mixed votes with caught + correct guess', () => {
      const votes = { p1: 'p2', p3: 'p4', p4: 'p2', p2: 'p1' };
      const scores = ScoringEngine.calculate({
        votes,
        imposterId,
        artistIds,
        imposterCaught: true,
        imposterGuessCorrect: true,
      });
      expect(scores['p1']).toBe(0); // 0 because imposter guessed correctly
      expect(scores['p3']).toBe(0);
      expect(scores['p4']).toBe(0);
      expect(scores['p2']).toBe(1); // caught but guessed word
    });
  });
});

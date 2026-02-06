import { Player } from '../src/Player';
import { PLAYER_COLORS } from '../../shared/types';

describe('Player', () => {
  describe('constructor', () => {
    it('should create a player with name and auto-assigned id', () => {
      const player = new Player('Alice', 0);

      expect(player.name).toBe('Alice');
      expect(player.id).toBeDefined();
      expect(typeof player.id).toBe('string');
      expect(player.id.length).toBeGreaterThan(0);
    });

    it('should assign color based on index from PLAYER_COLORS', () => {
      const player0 = new Player('Player0', 0);
      const player1 = new Player('Player1', 1);
      const player2 = new Player('Player2', 2);

      expect(player0.color).toBe(PLAYER_COLORS[0]);
      expect(player1.color).toBe(PLAYER_COLORS[1]);
      expect(player2.color).toBe(PLAYER_COLORS[2]);
    });

    it('should handle index wrapping for colors beyond palette length', () => {
      const index = PLAYER_COLORS.length + 2;
      const player = new Player('Player', index);

      expect(player.color).toBe(PLAYER_COLORS[index % PLAYER_COLORS.length]);
    });

    it('should initialize score to 0', () => {
      const player = new Player('Alice', 0);

      expect(player.score).toBe(0);
    });

    it('should initialize isReady to false', () => {
      const player = new Player('Alice', 0);

      expect(player.isReady).toBe(false);
    });

    it('should initialize isHost to false by default', () => {
      const player = new Player('Alice', 0);

      expect(player.isHost).toBe(false);
    });

    it('should set isHost to true when specified', () => {
      const player = new Player('Alice', 0, true);

      expect(player.isHost).toBe(true);
    });

    it('should generate unique ids for different players', () => {
      const player1 = new Player('Alice', 0);
      const player2 = new Player('Bob', 1);
      const player3 = new Player('Charlie', 2);

      expect(player1.id).not.toBe(player2.id);
      expect(player2.id).not.toBe(player3.id);
      expect(player1.id).not.toBe(player3.id);
    });
  });

  describe('toggleReady', () => {
    it('should toggle isReady from false to true', () => {
      const player = new Player('Alice', 0);

      expect(player.isReady).toBe(false);
      player.toggleReady();
      expect(player.isReady).toBe(true);
    });

    it('should toggle isReady from true to false', () => {
      const player = new Player('Alice', 0);

      player.toggleReady();
      expect(player.isReady).toBe(true);
      player.toggleReady();
      expect(player.isReady).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const player = new Player('Alice', 0);

      player.toggleReady();
      expect(player.isReady).toBe(true);
      player.toggleReady();
      expect(player.isReady).toBe(false);
      player.toggleReady();
      expect(player.isReady).toBe(true);
      player.toggleReady();
      expect(player.isReady).toBe(false);
    });
  });

  describe('addPoints', () => {
    it('should add points to score', () => {
      const player = new Player('Alice', 0);

      player.addPoints(10);
      expect(player.score).toBe(10);
    });

    it('should accumulate points from multiple additions', () => {
      const player = new Player('Alice', 0);

      player.addPoints(10);
      player.addPoints(5);
      player.addPoints(15);
      expect(player.score).toBe(30);
    });

    it('should handle zero points', () => {
      const player = new Player('Alice', 0);

      player.addPoints(10);
      player.addPoints(0);
      expect(player.score).toBe(10);
    });

    it('should handle negative points', () => {
      const player = new Player('Alice', 0);

      player.addPoints(20);
      player.addPoints(-5);
      expect(player.score).toBe(15);
    });

    it('should handle large point values', () => {
      const player = new Player('Alice', 0);

      player.addPoints(1000);
      player.addPoints(5000);
      expect(player.score).toBe(6000);
    });
  });

  describe('toData', () => {
    it('should return PlayerData object with all properties', () => {
      const player = new Player('Alice', 0);
      const data = player.toData();

      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('color');
      expect(data).toHaveProperty('isHost');
      expect(data).toHaveProperty('isReady');
      expect(data).toHaveProperty('score');
    });

    it('should return correct values for all properties', () => {
      const player = new Player('Alice', 0, true);
      player.toggleReady();
      player.addPoints(50);

      const data = player.toData();

      expect(data.id).toBe(player.id);
      expect(data.name).toBe('Alice');
      expect(data.color).toBe(PLAYER_COLORS[0]);
      expect(data.isHost).toBe(true);
      expect(data.isReady).toBe(true);
      expect(data.score).toBe(50);
    });

    it('should return serializable object', () => {
      const player = new Player('Alice', 0);
      const data = player.toData();

      expect(() => JSON.stringify(data)).not.toThrow();
      const serialized = JSON.stringify(data);
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(data);
    });

    it('should return object without methods', () => {
      const player = new Player('Alice', 0);
      const data = player.toData();

      expect(typeof data.toggleReady).toBe('undefined');
      expect(typeof data.addPoints).toBe('undefined');
      expect(typeof data.toData).toBe('undefined');
    });

    it('should return snapshot of current state', () => {
      const player = new Player('Alice', 0);
      const data1 = player.toData();

      player.toggleReady();
      player.addPoints(25);
      const data2 = player.toData();

      expect(data1.isReady).toBe(false);
      expect(data1.score).toBe(0);
      expect(data2.isReady).toBe(true);
      expect(data2.score).toBe(25);
    });
  });

  describe('property access', () => {
    it('should allow reading all properties', () => {
      const player = new Player('Alice', 2, true);

      expect(player.id).toBeDefined();
      expect(player.name).toBe('Alice');
      expect(player.color).toBe(PLAYER_COLORS[2]);
      expect(player.isHost).toBe(true);
      expect(player.isReady).toBe(false);
      expect(player.score).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty name', () => {
      const player = new Player('', 0);

      expect(player.name).toBe('');
      expect(player.id).toBeDefined();
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(1000);
      const player = new Player(longName, 0);

      expect(player.name).toBe(longName);
    });

    it('should handle special characters in name', () => {
      const player = new Player('Alice 🎨 <>&"\'', 0);

      expect(player.name).toBe('Alice 🎨 <>&"\'');
    });

    it('should handle negative index for color assignment', () => {
      const player = new Player('Alice', -1);

      expect(PLAYER_COLORS).toContain(player.color);
    });

    it('should handle very large index for color assignment', () => {
      const player = new Player('Alice', 999999);

      expect(PLAYER_COLORS).toContain(player.color);
    });
  });
});

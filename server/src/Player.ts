import { PLAYER_COLORS, PlayerData } from '../../shared/types';
import { randomUUID } from 'crypto';

export class Player {
  public readonly id: string;
  public readonly name: string;
  public readonly color: string;
  public readonly isHost: boolean;
  public isReady: boolean;
  public score: number;

  constructor(name: string, colorIndex: number, isHost: boolean = false) {
    this.id = randomUUID();
    this.name = name;
    this.isHost = isHost;
    this.isReady = false;
    this.score = 0;

    // Handle negative indices and wrapping
    const normalizedIndex = ((colorIndex % PLAYER_COLORS.length) + PLAYER_COLORS.length) % PLAYER_COLORS.length;
    this.color = PLAYER_COLORS[normalizedIndex];
  }

  toggleReady(): void {
    this.isReady = !this.isReady;
  }

  addPoints(points: number): void {
    this.score += points;
  }

  toData(): PlayerData {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      isHost: this.isHost,
      isReady: this.isReady,
      score: this.score,
    };
  }
}

export class TurnManager {
  private turnOrder: string[];
  private currentRound: number = 1;
  private turnIndex: number = 0;
  private readonly totalRounds: number;

  constructor(playerIds: string[], rounds: number = 2) {
    this.turnOrder = this.shuffle([...playerIds]);
    this.totalRounds = rounds;
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffle(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getTurnOrder(): string[] {
    return [...this.turnOrder];
  }

  getCurrentPlayerId(): string {
    return this.turnOrder[this.turnIndex];
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getRound(): number {
    return this.getCurrentRound();
  }

  getTurnIndex(): number {
    return this.turnIndex;
  }

  advanceTurn(): void {
    this.turnIndex++;
    if (this.turnIndex >= this.turnOrder.length) {
      this.turnIndex = 0;
      this.currentRound++;
    }
  }

  isComplete(): boolean {
    return this.currentRound > this.totalRounds;
  }
}

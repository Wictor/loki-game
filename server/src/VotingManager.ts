import { VoteResult } from '../../shared/types';

export class VotingManager {
  private playerIds: Set<string>;
  private imposterId: string;
  private votes: Map<string, string>; // voterId -> votedForId

  constructor(playerIds: string[], imposterId: string) {
    this.playerIds = new Set(playerIds);
    this.imposterId = imposterId;
    this.votes = new Map();
  }

  castVote(voterId: string, votedForId: string): void {
    // Check if voter is a valid player
    if (!this.playerIds.has(voterId)) {
      throw new Error('Voter is not a valid player');
    }

    // Check if voted-for is a valid player
    if (!this.playerIds.has(votedForId)) {
      throw new Error('Voted-for player is not valid');
    }

    // Check if voter is trying to vote for themselves
    if (voterId === votedForId) {
      throw new Error('Cannot vote for self');
    }

    // Check if voter has already voted
    if (this.votes.has(voterId)) {
      throw new Error('Player has already voted');
    }

    // Record the vote
    this.votes.set(voterId, votedForId);
  }

  getVoteCount(): number {
    return this.votes.size;
  }

  isComplete(): boolean {
    return this.votes.size === this.playerIds.size;
  }

  getResult(): VoteResult {
    // Convert votes Map to Record
    const votesRecord: Record<string, string> = {};
    this.votes.forEach((votedForId, voterId) => {
      votesRecord[voterId] = votedForId;
    });

    // Count votes for each player
    const voteCounts = new Map<string, number>();
    this.votes.forEach((votedForId) => {
      voteCounts.set(votedForId, (voteCounts.get(votedForId) || 0) + 1);
    });

    // Find player(s) with most votes
    let maxVotes = 0;
    let playersWithMaxVotes: string[] = [];

    voteCounts.forEach((count, playerId) => {
      if (count > maxVotes) {
        maxVotes = count;
        playersWithMaxVotes = [playerId];
      } else if (count === maxVotes) {
        playersWithMaxVotes.push(playerId);
      }
    });

    // Determine if there's a tie
    const isTie = playersWithMaxVotes.length > 1;
    const caughtPlayerId = isTie ? null : playersWithMaxVotes[0] || null;

    return {
      votes: votesRecord,
      caughtPlayerId,
      isTie,
    };
  }

  isCaughtPlayerImposter(): boolean {
    const result = this.getResult();

    // If there's a tie or no one was caught, return false
    if (result.isTie || result.caughtPlayerId === null) {
      return false;
    }

    // Check if the caught player is the imposter
    return result.caughtPlayerId === this.imposterId;
  }
}

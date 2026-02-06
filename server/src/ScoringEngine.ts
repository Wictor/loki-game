export interface ScoreInput {
  votes: Record<string, string>;       // voterId -> votedForId
  imposterId: string;
  artistIds: string[];
  imposterCaught: boolean;
  imposterGuessCorrect: boolean | null; // null if not caught
}

export class ScoringEngine {
  static calculate(input: ScoreInput): Record<string, number> {
    const { votes, imposterId, artistIds, imposterCaught, imposterGuessCorrect } = input;
    const scores: Record<string, number> = {};

    // Initialize all player scores to 0
    artistIds.forEach(id => {
      scores[id] = 0;
    });
    scores[imposterId] = 0;

    if (!imposterCaught) {
      // Imposter escapes: +2 for imposter, 0 for everyone else
      scores[imposterId] += 2;
    } else if (imposterGuessCorrect === true) {
      // Imposter caught but guesses word: +1 for imposter, 0 for all non-imposters
      scores[imposterId] += 1;
    } else {
      // Imposter caught, wrong guess: +1 for each non-imposter who voted correctly
      artistIds.forEach(artistId => {
        const votedFor = votes[artistId];
        if (votedFor === imposterId) {
          scores[artistId] += 1;
        }
      });
    }

    return scores;
  }
}

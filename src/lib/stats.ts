import { Tournament, Match, DeckStats, PlayDrawStats, MatchupStats, TournamentSummary } from './types';

export function calculateMatchResult(match: Match): { wins: number; losses: number; won: boolean } {
  const wins = match.games.filter(g => g.won).length;
  const losses = match.games.filter(g => !g.won).length;
  return { wins, losses, won: wins > losses };
}

export function getTournamentSummary(tournament: Tournament): TournamentSummary {
  let matchWins = 0;
  let matchLosses = 0;
  let gameWins = 0;
  let gameLosses = 0;

  tournament.matches.forEach(match => {
    const result = calculateMatchResult(match);
    if (result.won) {
      matchWins++;
    } else {
      matchLosses++;
    }
    gameWins += result.wins;
    gameLosses += result.losses;
  });

  return {
    id: tournament.id,
    date: tournament.date,
    location: tournament.location,
    matchWins,
    matchLosses,
    gameWins,
    gameLosses,
  };
}

export function calculateOverallStats(tournaments: Tournament[]) {
  let totalMatchWins = 0;
  let totalMatchLosses = 0;
  let totalGameWins = 0;
  let totalGameLosses = 0;

  tournaments.forEach(tournament => {
    const summary = getTournamentSummary(tournament);
    totalMatchWins += summary.matchWins;
    totalMatchLosses += summary.matchLosses;
    totalGameWins += summary.gameWins;
    totalGameLosses += summary.gameLosses;
  });

  const totalMatches = totalMatchWins + totalMatchLosses;
  const matchWinRate = totalMatches > 0 ? (totalMatchWins / totalMatches) * 100 : 0;

  return {
    totalMatchWins,
    totalMatchLosses,
    totalGameWins,
    totalGameLosses,
    matchWinRate: Math.round(matchWinRate),
  };
}

export function calculateDeckStats(tournaments: Tournament[]): DeckStats[] {
  const deckMap = new Map<string, { wins: number; losses: number }>();

  tournaments.forEach(tournament => {
    tournament.matches.forEach(match => {
      const result = calculateMatchResult(match);
      const current = deckMap.get(match.myDeck) || { wins: 0, losses: 0 };

      if (result.won) {
        current.wins++;
      } else {
        current.losses++;
      }

      deckMap.set(match.myDeck, current);
    });
  });

  return Array.from(deckMap.entries()).map(([deckName, stats]) => {
    const total = stats.wins + stats.losses;
    return {
      deckName,
      matchWins: stats.wins,
      matchLosses: stats.losses,
      winRate: total > 0 ? (stats.wins / total) * 100 : 0,
    };
  }).sort((a, b) => b.winRate - a.winRate);
}

export function calculatePlayDrawStats(tournaments: Tournament[]): PlayDrawStats {
  let onPlayWins = 0;
  let onPlayTotal = 0;
  let onDrawWins = 0;
  let onDrawTotal = 0;

  tournaments.forEach(tournament => {
    tournament.matches.forEach(match => {
      match.games.forEach(game => {
        if (game.onPlay) {
          onPlayTotal++;
          if (game.won) onPlayWins++;
        } else {
          onDrawTotal++;
          if (game.won) onDrawWins++;
        }
      });
    });
  });

  return {
    onPlayWins,
    onPlayTotal,
    onDrawWins,
    onDrawTotal,
    onPlayWinRate: onPlayTotal > 0 ? (onPlayWins / onPlayTotal) * 100 : 0,
    onDrawWinRate: onDrawTotal > 0 ? (onDrawWins / onDrawTotal) * 100 : 0,
  };
}

export function calculateMatchupStats(tournaments: Tournament[]): MatchupStats[] {
  const matchupMap = new Map<string, { wins: number; losses: number }>();

  tournaments.forEach(tournament => {
    tournament.matches.forEach(match => {
      if (!match.opponentDeck) return;

      const result = calculateMatchResult(match);
      const current = matchupMap.get(match.opponentDeck) || { wins: 0, losses: 0 };

      if (result.won) {
        current.wins++;
      } else {
        current.losses++;
      }

      matchupMap.set(match.opponentDeck, current);
    });
  });

  return Array.from(matchupMap.entries()).map(([opponentDeck, stats]) => {
    const total = stats.wins + stats.losses;
    return {
      opponentDeck,
      wins: stats.wins,
      losses: stats.losses,
      winRate: total > 0 ? (stats.wins / total) * 100 : 0,
    };
  }).sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));
}

export function calculateWinRateTrend(tournaments: Tournament[]): { date: string; winRate: number }[] {
  const sorted = [...tournaments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return sorted.map(tournament => {
    const summary = getTournamentSummary(tournament);
    const total = summary.matchWins + summary.matchLosses;
    const winRate = total > 0 ? (summary.matchWins / total) * 100 : 0;

    return {
      date: tournament.date,
      winRate: Math.round(winRate),
    };
  });
}

export interface Game {
  onPlay: boolean;
  won: boolean;
}

export interface Match {
  id: string;
  opponentName: string;
  myDeck: string;
  opponentDeck: string;
  games: Game[];
  notes?: string;
}

export interface Tournament {
  id: string;
  date: string;
  location: string;
  format: string;
  matches: Match[];
}

export interface TournamentSummary {
  id: string;
  date: string;
  location: string;
  matchWins: number;
  matchLosses: number;
  gameWins: number;
  gameLosses: number;
}

export interface DeckStats {
  deckName: string;
  matchWins: number;
  matchLosses: number;
  winRate: number;
}

export interface PlayDrawStats {
  onPlayWins: number;
  onPlayTotal: number;
  onDrawWins: number;
  onDrawTotal: number;
  onPlayWinRate: number;
  onDrawWinRate: number;
}

export interface MatchupStats {
  opponentDeck: string;
  wins: number;
  losses: number;
  winRate: number;
}

import { Tournament, Match } from './types';

export const INBOX_ID = '__inbox__';

const isDev = process.env.NODE_ENV === 'development';

// Dynamically import the right data layer
async function getDataLayer() {
  if (isDev) {
    return await import('./data-local');
  } else {
    return await import('./data-supabase');
  }
}

// --- Data Access ---

export async function getTournaments(): Promise<Tournament[]> {
  const layer = await getDataLayer();
  return layer.getTournaments();
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  const layer = await getDataLayer();
  return layer.getTournamentById(id);
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  const layer = await getDataLayer();
  return layer.saveTournament(tournament);
}

export async function deleteTournament(id: string): Promise<void> {
  const layer = await getDataLayer();
  return layer.deleteTournament(id);
}

// --- Match Operations ---

export async function addMatch(tournamentId: string, match: Match): Promise<void> {
  const layer = await getDataLayer();
  return layer.addMatch(tournamentId, match);
}

export async function updateMatch(tournamentId: string, matchId: string, updatedMatch: Match): Promise<void> {
  const layer = await getDataLayer();
  return layer.updateMatch(tournamentId, matchId, updatedMatch);
}

export async function deleteMatch(tournamentId: string, matchId: string): Promise<void> {
  const layer = await getDataLayer();
  return layer.deleteMatch(tournamentId, matchId);
}

// --- Helpers ---

export async function getInboxMatches(): Promise<Match[]> {
  const layer = await getDataLayer();
  return layer.getInboxMatches();
}

export async function moveMatch(matchId: string, fromTournamentId: string, toTournamentId: string): Promise<boolean> {
  const layer = await getDataLayer();
  return layer.moveMatch(matchId, fromTournamentId, toTournamentId);
}

export async function getAllDeckNames(): Promise<string[]> {
  const layer = await getDataLayer();
  return layer.getAllDeckNames();
}

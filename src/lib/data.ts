import { Tournament, Match } from './types';

export const INBOX_ID = '__inbox__';

const isDev = process.env.NODE_ENV === 'development';

// We conditionally import at the top level to avoid dynamic import issues
// with Next.js bundling. The fs-based local layer is only used in development.
import * as supabaseLayer from './data-supabase';

// --- Data Access ---

export async function getTournaments(): Promise<Tournament[]> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.getTournaments();
  }
  return supabaseLayer.getTournaments();
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.getTournamentById(id);
  }
  return supabaseLayer.getTournamentById(id);
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.saveTournament(tournament);
  }
  return supabaseLayer.saveTournament(tournament);
}

export async function deleteTournament(id: string): Promise<void> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.deleteTournament(id);
  }
  return supabaseLayer.deleteTournament(id);
}

// --- Match Operations ---

export async function addMatch(tournamentId: string, match: Match): Promise<void> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.addMatch(tournamentId, match);
  }
  return supabaseLayer.addMatch(tournamentId, match);
}

export async function updateMatch(tournamentId: string, matchId: string, updatedMatch: Match): Promise<void> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.updateMatch(tournamentId, matchId, updatedMatch);
  }
  return supabaseLayer.updateMatch(tournamentId, matchId, updatedMatch);
}

export async function deleteMatch(tournamentId: string, matchId: string): Promise<void> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.deleteMatch(tournamentId, matchId);
  }
  return supabaseLayer.deleteMatch(tournamentId, matchId);
}

// --- Helpers ---

export async function getInboxMatches(): Promise<Match[]> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.getInboxMatches();
  }
  return supabaseLayer.getInboxMatches();
}

export async function moveMatch(matchId: string, fromTournamentId: string, toTournamentId: string): Promise<boolean> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.moveMatch(matchId, fromTournamentId, toTournamentId);
  }
  return supabaseLayer.moveMatch(matchId, fromTournamentId, toTournamentId);
}

export async function getAllDeckNames(): Promise<string[]> {
  if (isDev) {
    const localLayer = await import('./data-local');
    return localLayer.getAllDeckNames();
  }
  return supabaseLayer.getAllDeckNames();
}

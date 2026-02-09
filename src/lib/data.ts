import { supabase } from './supabase';
import { Tournament, Match } from './types';

// Re-declare to avoid circular dep if we split files later, but here we are replacing content.
export const INBOX_ID = '__inbox__';

// --- Helper to ensure Inbox exists (now simpler, checks DB) ---
async function ensureInboxExists() {
  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', INBOX_ID)
    .single();

  if (!data) {
    await supabase.from('tournaments').insert([{
      id: INBOX_ID,
      date: '',
      location: 'Inbox',
      format: '',
      gameType: 'Magic',
      matches: [] // Storing matches as JSONB for now to minimize schema changes MVP
    }]);
  }
}

// --- Data Access ---

export async function getTournaments(): Promise<Tournament[]> {
  // If no keys, return empty (or throw)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const { data, error } = await supabase.from('tournaments').select('*');
  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  // Normalize data: ensure all tournaments have gameType
  const normalized = data.map((t: Tournament) => ({
    ...t,
    gameType: t.gameType || 'Magic' as 'Magic' | 'Riftbound'
  }));

  // Ensure we have an inbox locally in the list, if not in DB, create it.
  const hasInbox = normalized.some((t: Tournament) => t.id === INBOX_ID);
  if (!hasInbox) {
    // Fire and forget creation
    ensureInboxExists();
    // Return with fake inbox for now
    return [{ id: INBOX_ID, date: '', location: 'Inbox', format: '', gameType: 'Magic', matches: [] }, ...normalized];
  }

  return normalized;
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  const { error } = await supabase
    .from('tournaments')
    .upsert(tournament);

  if (error) console.error('Save tournament error:', error);
}

export async function deleteTournament(id: string): Promise<void> {
  await supabase.from('tournaments').delete().eq('id', id);
}

// --- Match Operations ---
// Note: Since we are likely using a JSONB column for 'matches' inside the 'tournaments' table 
// to avoid massive refactoring of the entire app's type system in one go,
// we fetch the tournament, modify the array, and save it back.
// Ideally, we'd have a separate 'matches' table, but that changes the data shape widely.
// For this MVP step: Read -> Modify -> Write (Optimistic Locking needed in real app, but ok for MVP)

export async function addMatch(tournamentId: string, match: Match): Promise<void> {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) return;

  tournament.matches.push(match);
  await saveTournament(tournament);
}

export async function updateMatch(tournamentId: string, matchId: string, updatedMatch: Match): Promise<void> {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) return;

  const index = tournament.matches.findIndex(m => m.id === matchId);
  if (index >= 0) {
    tournament.matches[index] = updatedMatch;
    await saveTournament(tournament);
  }
}

export async function deleteMatch(tournamentId: string, matchId: string): Promise<void> {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) return;

  tournament.matches = tournament.matches.filter(m => m.id !== matchId);
  await saveTournament(tournament);
}

// --- Helpers ---

export async function getInboxMatches(): Promise<Match[]> {
  const inbox = await getTournamentById(INBOX_ID);
  return inbox?.matches || [];
}

export async function moveMatch(matchId: string, fromTournamentId: string, toTournamentId: string): Promise<boolean> {
  const source = await getTournamentById(fromTournamentId);
  const target = await getTournamentById(toTournamentId);

  if (!source || !target) return false;

  const matchIndex = source.matches.findIndex(m => m.id === matchId);
  if (matchIndex < 0) return false;

  const [match] = source.matches.splice(matchIndex, 1);
  target.matches.push(match);

  // We need to save both. Transaction would be better, but Promise.all is okay for MVP.
  await Promise.all([
    saveTournament(source),
    saveTournament(target)
  ]);

  return true;
}

export async function getAllDeckNames(): Promise<string[]> {
  const tournaments = await getTournaments();
  const deckNames = new Set<string>();

  tournaments.forEach(tournament => {
    tournament.matches.forEach(match => {
      if (match.myDeck) deckNames.add(match.myDeck);
      if (match.opponentDeck) deckNames.add(match.opponentDeck);
    });
  });

  return Array.from(deckNames).sort();
}

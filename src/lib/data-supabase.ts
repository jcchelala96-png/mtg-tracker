import { supabase } from './supabase';
import { Tournament, Match } from './types';

const INBOX_ID = '__inbox__';

// --- Helper to ensure Inbox exists ---
export async function ensureInboxExists() {
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
            matches: []
        }]);
    }
}

// --- Data Access ---

// --- Helper to ensure array ---
function ensureArray<T>(item: any): T[] {
    return Array.isArray(item) ? item : [];
}

// --- Data Access ---

export async function getTournaments(): Promise<Tournament[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data, error } = await supabase.from('tournaments').select('*');
    if (error) {
        console.error('Supabase error:', error);
        return [];
    }

    // Normalize data: ensure all tournaments have gameType and matches is strictly an array
    const normalized = data.map((t: any) => ({
        ...t,
        gameType: t.gameType || 'Magic',
        matches: ensureArray<Match>(t.matches).map((m: any) => ({
            ...m,
            games: ensureArray(m.games)
        }))
    })) as Tournament[];

    const hasInbox = normalized.some((t: Tournament) => t.id === INBOX_ID);
    if (!hasInbox) {
        await ensureInboxExists();
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
    if (data) {
        // Fix strict null check and type safety
        const safeData = data as any;
        safeData.matches = ensureArray<Match>(safeData.matches).map((m: any) => ({
            ...m,
            games: ensureArray(m.games)
        }));
        return safeData as Tournament;
    }
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

export async function addMatch(tournamentId: string, match: Match): Promise<void> {
    let tournament = await getTournamentById(tournamentId);

    // Check if we are trying to add to a non-existent inbox
    if (!tournament && tournamentId === INBOX_ID) {
        await ensureInboxExists();
        tournament = await getTournamentById(tournamentId);
    }

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

    await Promise.all([saveTournament(source), saveTournament(target)]);
    return true;
}

export async function getAllDeckNames(): Promise<string[]> {
    const tournaments = await getTournaments();
    const deckNames = new Set<string>();
    tournaments.forEach(tournament => {
        ensureArray<Match>(tournament.matches).forEach(match => {
            if (match.myDeck) deckNames.add(match.myDeck);
            if (match.opponentDeck) deckNames.add(match.opponentDeck);
        });
    });
    return Array.from(deckNames).sort();
}

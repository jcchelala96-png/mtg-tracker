import { Tournament, Match } from './types';
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'local-tournaments.json');

function ensureDataDir() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readData(): Tournament[] {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
        return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Tournament[];
}

function writeData(tournaments: Tournament[]) {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(tournaments, null, 2));
}

// --- Helper to ensure Inbox exists ---
function ensureInboxExists(tournaments: Tournament[]) {
    const hasInbox = tournaments.some(t => t.id === '__inbox__');
    if (!hasInbox) {
        tournaments.unshift({
            id: '__inbox__',
            date: '',
            location: 'Inbox',
            format: '',
            gameType: 'Magic',
            matches: []
        });
        writeData(tournaments);
    }
}

// --- Data Access ---

export async function getTournaments(): Promise<Tournament[]> {
    const tournaments = readData();
    ensureInboxExists(tournaments);
    return tournaments;
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
    const tournaments = readData();
    // Ensure inbox exists if requested
    if (id === '__inbox__') {
        ensureInboxExists(tournaments);
        return tournaments.find(t => t.id === id) || null;
    }
    return tournaments.find(t => t.id === id) || null;
}

export async function saveTournament(tournament: Tournament): Promise<void> {
    const tournaments = readData();
    const index = tournaments.findIndex(t => t.id === tournament.id);
    if (index >= 0) {
        tournaments[index] = tournament;
    } else {
        tournaments.push(tournament);
    }
    writeData(tournaments);
}

export async function deleteTournament(id: string): Promise<void> {
    const tournaments = readData();
    writeData(tournaments.filter(t => t.id !== id));
}

// --- Match Operations ---

export async function addMatch(tournamentId: string, match: Match): Promise<void> {
    let tournament = await getTournamentById(tournamentId);

    // Check if we are trying to add to a non-existent inbox
    if (!tournament && tournamentId === '__inbox__') {
        // Force create inbox
        const tournaments = readData();
        ensureInboxExists(tournaments);
        tournament = tournaments.find(t => t.id === '__inbox__') || null;
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
    const inbox = await getTournamentById('__inbox__');
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
        tournament.matches.forEach(match => {
            if (match.myDeck) deckNames.add(match.myDeck);
            if (match.opponentDeck) deckNames.add(match.opponentDeck);
        });
    });
    return Array.from(deckNames).sort();
}

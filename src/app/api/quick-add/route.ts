import { NextResponse } from "next/server";
import { addMatch, INBOX_ID, getAllDeckNames } from "@/lib/data";
import { Match, Game } from "@/lib/types";

// GET: returns all deck names for autocomplete
export async function GET() {
    try {
        const deckNames = await getAllDeckNames();
        return NextResponse.json({ deckNames });
    } catch (error) {
        return NextResponse.json({ error: "Failed to get decks" }, { status: 500 });
    }
}

// POST: add a match to inbox
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { myDeck, opponentDeck, onPlay, result, notes } = body;

        // Convert result string (e.g. "2-0", "1-2") to games array
        const games: Game[] = [];
        const [myWins, opponentWins] = result.split('-').map(Number);

        const totalGames = myWins + opponentWins;
        let myCurrentWins = 0;
        let opponentCurrentWins = 0;

        for (let i = 0; i < totalGames; i++) {
            const isMyWin = myCurrentWins < myWins && (i % 2 === 0 || opponentCurrentWins === opponentWins);
            if (isMyWin) myCurrentWins++;
            else opponentCurrentWins++;

            games.push({
                // Alternating Play/Draw: G1 = onPlay, G2 = !onPlay, G3 = onPlay
                onPlay: i % 2 === 0 ? onPlay : !onPlay,
                won: isMyWin
            });
        }

        const match: Match = {
            id: crypto.randomUUID(),
            opponentName: '',
            myDeck,
            opponentDeck,
            games,
            notes: notes || '',
        };

        await addMatch(INBOX_ID, match);
        return NextResponse.json({ success: true, matchId: match.id });
    } catch (error) {
        console.error('Quick add error:', error);
        return NextResponse.json({ error: "Failed to add match" }, { status: 500 });
    }
}

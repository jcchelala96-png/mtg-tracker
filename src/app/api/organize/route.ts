import { NextResponse } from "next/server";
import { moveMatch, INBOX_ID, getTournaments } from "@/lib/data";

export async function POST(request: Request) {
    try {
        const { matchId, targetTournamentId } = await request.json();

        if (!matchId || !targetTournamentId) {
            return NextResponse.json({ error: "Missing matchId or targetTournamentId" }, { status: 400 });
        }

        const success = await moveMatch(matchId, INBOX_ID, targetTournamentId);

        if (!success) {
            return NextResponse.json({ error: "Failed to move match" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to move match" }, { status: 500 });
    }
}

// GET: returns tournaments list (excluding inbox) for the dropdown
export async function GET() {
    try {
        const allTournaments = await getTournaments();
        const tournaments = allTournaments.filter(t => t.id !== INBOX_ID);
        return NextResponse.json({ tournaments });
    } catch (error) {
        return NextResponse.json({ error: "Failed to get tournaments" }, { status: 500 });
    }
}

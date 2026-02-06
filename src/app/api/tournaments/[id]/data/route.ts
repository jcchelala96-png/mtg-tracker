import { NextResponse } from "next/server";
import { getTournamentById } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = getTournamentById(params.id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
    return NextResponse.json(tournament);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 });
  }
}

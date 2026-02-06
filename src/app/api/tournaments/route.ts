import { NextResponse } from "next/server";
import { saveTournament } from "@/lib/data";
import { Tournament } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const tournament: Tournament = await request.json();
    saveTournament(tournament);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}

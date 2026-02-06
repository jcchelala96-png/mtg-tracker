import { NextResponse } from "next/server";
import { addMatch, updateMatch, deleteMatch } from "@/lib/data";
import { Match } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const match: Match = await request.json();
    await addMatch(params.id, match);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add match" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const match: Match = await request.json();
    await updateMatch(params.id, match.id, match);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    if (!matchId) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }
    await deleteMatch(params.id, matchId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}

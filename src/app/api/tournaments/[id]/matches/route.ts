import { NextResponse } from "next/server";
import { addMatch, updateMatch, deleteMatch } from "@/lib/data";
import { Match } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match: Match = await request.json();
    await addMatch(id, match);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add match";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match: Match = await request.json();
    await updateMatch(id, match.id, match);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update match";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    if (!matchId) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }
    await deleteMatch(id, matchId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete match";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

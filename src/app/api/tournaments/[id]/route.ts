import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteTournament, saveTournament } from "@/lib/data";
import { Tournament } from "@/lib/types";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTournament(id);
    revalidatePath("/tournaments");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete tournament" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament: Tournament = await request.json();

    // Ensure the ID matches
    if (tournament.id !== id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    await saveTournament(tournament);
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${id}`);
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tournament" }, { status: 500 });
  }
}

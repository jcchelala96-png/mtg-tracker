import { NextResponse } from "next/server";
import { deleteTournament } from "@/lib/data";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    deleteTournament(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete tournament" }, { status: 500 });
  }
}

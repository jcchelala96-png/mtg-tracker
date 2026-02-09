import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveTournament } from "@/lib/data";
import { Tournament } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const tournament: Tournament = await request.json();
    await saveTournament(tournament);
    revalidatePath("/tournaments");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}

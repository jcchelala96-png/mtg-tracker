import { NextResponse } from "next/server";
import { getAllDeckNames } from "@/lib/data";

export async function GET() {
  try {
    const deckNames = getAllDeckNames();
    return NextResponse.json(deckNames);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deck names" }, { status: 500 });
  }
}

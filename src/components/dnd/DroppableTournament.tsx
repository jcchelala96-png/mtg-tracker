"use client";

import { useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TournamentSummary {
    id: string;
    date: string;
    location: string;
    matchWins: number;
    matchLosses: number;
    gameWins: number;
    gameLosses: number;
}

interface DroppableTournamentProps {
    tournament: TournamentSummary;
}

export function DroppableTournament({ tournament }: DroppableTournamentProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: tournament.id,
        data: { tournamentId: tournament.id },
    });

    return (
        <Card
            ref={setNodeRef}
            className={`transition-all duration-200 ${isOver
                    ? "ring-2 ring-primary bg-primary/10 scale-[1.02]"
                    : ""
                }`}
        >
            <CardHeader>
                <CardTitle>{tournament.date}</CardTitle>
                <CardDescription>{tournament.location}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <p className="text-sm">
                        <span className="font-medium">Match Record:</span> {tournament.matchWins}-{tournament.matchLosses}
                    </p>
                    <p className="text-sm">
                        <span className="font-medium">Game Record:</span> {tournament.gameWins}-{tournament.gameLosses}
                    </p>
                    <Button asChild variant="link" className="px-0 mt-2">
                        <Link href={`/tournaments/${tournament.id}`}>View Details →</Link>
                    </Button>
                </div>
                {isOver && (
                    <div className="mt-2 text-sm text-primary font-medium animate-pulse">
                        Drop to add match here
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

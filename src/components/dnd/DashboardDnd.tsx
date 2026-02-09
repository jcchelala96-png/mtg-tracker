"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, TouchSensor, KeyboardSensor } from "@dnd-kit/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";
import Link from "next/link";
import { DraggableMatch } from "@/components/dnd/DraggableMatch";
import { DroppableTournament } from "@/components/dnd/DroppableTournament";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { InboxMatchForm } from "@/components/match/InboxMatchForm";
import { useEffect } from "react";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";

interface Match {
    id: string;
    myDeck: string;
    opponentDeck: string;
    games: { onPlay: boolean; won: boolean }[];
    notes?: string;
}

interface TournamentSummary {
    id: string;
    date: string;
    location: string;
    matchWins: number;
    matchLosses: number;
    gameWins: number;
    gameLosses: number;
}

interface DashboardDndProps {
    initialInboxMatches: Match[];
    tournamentSummaries: TournamentSummary[];
}

export function DashboardDnd({ initialInboxMatches, tournamentSummaries }: DashboardDndProps) {
    const { performMutation } = useOfflineMutation();
    const [inboxMatches, setInboxMatches] = useState<Match[]>(initialInboxMatches);
    const [activeMatch, setActiveMatch] = useState<Match | null>(null);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [deckNames, setDeckNames] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/quick-add")
            .then(res => res.json())
            .then(data => setDeckNames(data.deckNames || []))
            .catch(() => { });
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150, // Reduced from 250ms for faster response
                tolerance: 10, // Increased from 5px for easier touch activation
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: any) => {
        const match = inboxMatches.find((m) => m.id === event.active.id);
        if (match) {
            setActiveMatch(match);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveMatch(null);

        const { active, over } = event;
        if (!over) return;

        const matchId = active.id as string;
        const targetTournamentId = over.id as string;

        // Optimistically remove from inbox
        setInboxMatches((prev) => prev.filter((m) => m.id !== matchId));

        try {
            const res = await performMutation("/api/organize", "POST", { matchId, targetTournamentId });

            if (res.error) {
                // Revert if API specifically returned error
                const match = initialInboxMatches.find((m) => m.id === matchId);
                if (match) setInboxMatches((prev) => [...prev, match]);
            }
        } catch (err) {
            // Revert on error
            const match = initialInboxMatches.find((m) => m.id === matchId);
            if (match) setInboxMatches((prev) => [...prev, match]);
        }
    };

    const handleSaveMatch = async (updatedMatch: Match) => {
        const res = await performMutation(`/api/tournaments/__inbox__/matches?matchId=${updatedMatch.id}`, "PUT", updatedMatch);
        if (res.success || res.ok) {
            setInboxMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
            setEditingMatch(null);
        }
    };

    const handleDeleteMatch = async (matchId: string) => {
        const res = await performMutation(`/api/tournaments/__inbox__/matches?matchId=${matchId}`, "DELETE", {});
        if (res.success || res.ok) {
            setInboxMatches(prev => prev.filter(m => m.id !== matchId));
            setEditingMatch(null);
        }
    };

    if (inboxMatches.length === 0 && tournamentSummaries.length === 0) {
        return null;
    }


    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Inbox Section - only show if there are matches */}
            {inboxMatches.length > 0 && (
                <Card className="border-orange-500/50 bg-orange-500/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Inbox className="h-5 w-5 text-orange-500" />
                                <CardTitle>Unorganized Results</CardTitle>
                                <Badge variant="secondary">{inboxMatches.length}</Badge>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/organize">Organize</Link>
                            </Button>
                        </div>
                        <CardDescription>
                            Drag matches to a tournament below, or click Organize for bulk actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {inboxMatches.map((match) => (
                                <DraggableMatch key={match.id} match={match} onEdit={setEditingMatch} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Match Dialog */}
            <Dialog open={editingMatch !== null} onOpenChange={(open) => !open && setEditingMatch(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Match</DialogTitle>
                        <DialogDescription>
                            Update your match details or delete it from the inbox.
                        </DialogDescription>
                    </DialogHeader>
                    {editingMatch && (
                        <InboxMatchForm
                            match={editingMatch}
                            deckNames={deckNames}
                            onSave={handleSaveMatch}
                            onDelete={handleDeleteMatch}
                            onCancel={() => setEditingMatch(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Recent Tournaments as drop zones */}
            {tournamentSummaries.length > 0 && inboxMatches.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Drop into Tournament</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {tournamentSummaries.map((tournament) => (
                            <DroppableTournament key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                </div>
            )}

            {/* Drag overlay for visual feedback */}
            <DragOverlay>
                {activeMatch ? (
                    <div className="p-3 rounded-lg bg-card border shadow-lg">
                        <span className="font-medium">{activeMatch.myDeck}</span>
                        <span className="text-muted-foreground"> vs </span>
                        <span>{activeMatch.opponentDeck}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

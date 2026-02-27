"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, Loader2, Check, Inbox } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Match {
    id: string;
    myDeck: string;
    opponentDeck: string;
    games: { won: boolean }[];
    notes?: string;
}

interface Tournament {
    id: string;
    date: string;
    location: string;
}

export default function OrganizePage() {
    const router = useRouter();
    const [inboxMatches, setInboxMatches] = useState<Match[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
    const [selectedTournament, setSelectedTournament] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [moving, setMoving] = useState(false);

    const fetchData = async () => {
        try {
            const [inboxRes, tournamentsRes] = await Promise.all([
                fetch("/api/tournaments/__inbox__/data"),
                fetch("/api/organize"),
            ]);
            const inboxData = await inboxRes.json();
            const tournamentsData = await tournamentsRes.json();
            setInboxMatches(inboxData.matches || []);
            setTournaments(tournamentsData.tournaments || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMove = async () => {
        if (!selectedMatch || !selectedTournament) return;

        setMoving(true);
        try {
            const res = await fetch("/api/organize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    matchId: selectedMatch,
                    targetTournamentId: selectedTournament,
                }),
            });

            if (res.ok) {
                // Remove from local state
                setInboxMatches(prev => prev.filter(m => m.id !== selectedMatch));
                setSelectedMatch(null);
                setSelectedTournament("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMoving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="mb-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            <div className="flex items-center gap-2 mb-4">
                <Inbox className="h-6 w-6 text-orange-500" />
                <h1 className="text-2xl font-bold">Organize Results</h1>
                <Badge variant="secondary">{inboxMatches.length}</Badge>
            </div>

            {inboxMatches.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">All caught up!</p>
                        <p className="text-muted-foreground">No unorganized results</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {inboxMatches.map((match) => {
                        const wins = match.games.filter((g) => g.won).length;
                        const losses = match.games.filter((g) => !g.won).length;
                        const isSelected = selectedMatch === match.id;

                        return (
                            <Card
                                key={match.id}
                                className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"
                                    }`}
                                onClick={() => setSelectedMatch(isSelected ? null : match.id)}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{match.myDeck}</p>
                                            <p className="text-sm text-muted-foreground">
                                                vs {match.opponentDeck}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={wins > losses ? "default" : "destructive"}>
                                                {wins}-{losses}
                                            </Badge>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="mt-4 pt-4 border-t space-y-3">
                                            <Select
                                                value={selectedTournament}
                                                onValueChange={setSelectedTournament}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select tournament..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tournaments.map((t) => (
                                                        <SelectItem key={t.id} value={t.id}>
                                                            {t.date} - {t.location}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMove();
                                                }}
                                                disabled={!selectedTournament || moving}
                                                className="w-full"
                                            >
                                                {moving ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Move to Tournament"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

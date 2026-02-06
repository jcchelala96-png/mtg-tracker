"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Zap } from "lucide-react";
import { DashboardDnd } from "@/components/dnd/DashboardDnd";
import { QuickAddDialog } from "@/components/match/QuickAddDialog";
import { getTournamentSummary } from "@/lib/stats";
import { Tournament, Match, TournamentSummary } from "@/lib/types";

interface Stats {
    totalMatchWins: number;
    totalMatchLosses: number;
    totalGameWins: number;
    totalGameLosses: number;
    matchWinRate: number;
}

interface DashboardClientProps {
    tournaments: Tournament[];
    inboxMatches: Match[];
    stats: Stats;
    tournamentSummaries: TournamentSummary[];
}

export function DashboardClient({ tournaments, inboxMatches, stats, tournamentSummaries }: DashboardClientProps) {
    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const recentTournaments = tournaments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4);

    const handleQuickAddSuccess = () => {
        setRefreshKey(prev => prev + 1);
        // Trigger a page refresh to get updated server data
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            {/* Quick Add CTA - Mobile First */}
            <Card className="border-primary/50 bg-primary/5">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-bold">Quick Add Result</h2>
                            <p className="text-muted-foreground text-sm">Add a match result instantly</p>
                        </div>
                        <Button size="lg" className="w-full sm:w-auto h-14 text-lg" onClick={() => setQuickAddOpen(true)}>
                            <Zap className="mr-2 h-5 w-5" />
                            Add Result
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* DnD Section - Inbox + Droppable Tournaments */}
            <DashboardDnd
                key={refreshKey}
                initialInboxMatches={inboxMatches}
                tournamentSummaries={tournamentSummaries}
            />

            {/* Quick Add Dialog */}
            <QuickAddDialog
                open={quickAddOpen}
                onOpenChange={setQuickAddOpen}
                onSuccess={handleQuickAddSuccess}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to your MTG Tournament Tracker</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/tournaments/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Tournament
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Match Record</CardTitle>
                        <CardDescription>Overall match win/loss</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalMatchWins}-{stats.totalMatchLosses}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Win Rate</CardTitle>
                        <CardDescription>Overall match win percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.matchWinRate}%</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Game Record</CardTitle>
                        <CardDescription>Overall game win/loss</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalGameWins}-{stats.totalGameLosses}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tournaments - Static display when no inbox matches */}
            {inboxMatches.length === 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Tournaments</h2>
                    {recentTournaments.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No tournaments yet. Create your first tournament to get started!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {recentTournaments.map((tournament) => {
                                const summary = getTournamentSummary(tournament);
                                return (
                                    <Card key={tournament.id}>
                                        <CardHeader>
                                            <CardTitle>{tournament.date}</CardTitle>
                                            <CardDescription>{tournament.location}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">Match Record:</span> {summary.matchWins}-{summary.matchLosses}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">Game Record:</span> {summary.gameWins}-{summary.gameLosses}
                                                </p>
                                                <Button asChild variant="link" className="px-0 mt-2">
                                                    <Link href={`/tournaments/${tournament.id}`}>View Details →</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  calculateOverallStats,
  calculateDeckStats,
  calculatePlayDrawStats,
  calculateMatchupStats,
  calculateWinRateTrend,
} from "@/lib/stats";
import { Tournament, GameType } from "@/lib/types";
import WinRateChart from "./WinRateChart";
import DeckStats from "./DeckStats";

interface StatsDashboardProps {
  initialTournaments: Tournament[];
}

export default function StatsDashboard({ initialTournaments }: StatsDashboardProps) {
  const [selectedGameType, setSelectedGameType] = useState<GameType>("Magic");

  const filteredTournaments = useMemo(
    () => initialTournaments.filter((t) => t.gameType === selectedGameType),
    [initialTournaments, selectedGameType]
  );

  const overallStats = useMemo(() => calculateOverallStats(filteredTournaments), [filteredTournaments]);
  const deckStats = useMemo(() => calculateDeckStats(filteredTournaments), [filteredTournaments]);
  const playDrawStats = useMemo(() => calculatePlayDrawStats(filteredTournaments), [filteredTournaments]);
  const matchupStats = useMemo(() => calculateMatchupStats(filteredTournaments), [filteredTournaments]);
  const winRateTrend = useMemo(() => calculateWinRateTrend(filteredTournaments), [filteredTournaments]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">Detailed analytics of your tournament performance</p>
        </div>
        <div className="w-[180px]">
          <Select value={selectedGameType} onValueChange={(value: GameType) => setSelectedGameType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Magic">Magic</SelectItem>
              <SelectItem value="Riftbound">Riftbound</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Record</CardTitle>
            <CardDescription>All-time match performance ({selectedGameType})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {overallStats.totalMatchWins}-{overallStats.totalMatchLosses}
              </div>
              <div className="text-sm text-muted-foreground">
                {overallStats.matchWinRate}% win rate
              </div>
              <div className="text-sm text-muted-foreground">
                {overallStats.totalGameWins}-{overallStats.totalGameLosses} games
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Play vs Draw</CardTitle>
            <CardDescription>Win rate comparison ({selectedGameType})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium">On the Play</div>
                <div className="text-xl font-bold">
                  {playDrawStats.onPlayWinRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {playDrawStats.onPlayWins}-{playDrawStats.onPlayTotal - playDrawStats.onPlayWins} ({playDrawStats.onPlayTotal} games)
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">On the Draw</div>
                <div className="text-xl font-bold">
                  {playDrawStats.onDrawWinRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {playDrawStats.onDrawWins}-{playDrawStats.onDrawTotal - playDrawStats.onDrawWins} ({playDrawStats.onDrawTotal} games)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Win Rate Trend</CardTitle>
          <CardDescription>Match win percentage over time ({selectedGameType})</CardDescription>
        </CardHeader>
        <CardContent>
          <WinRateChart data={winRateTrend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deck Performance</CardTitle>
          <CardDescription>Win rate by deck ({selectedGameType})</CardDescription>
        </CardHeader>
        <CardContent>
          <DeckStats data={deckStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matchup Matrix</CardTitle>
          <CardDescription>Performance vs opponent decks ({selectedGameType})</CardDescription>
        </CardHeader>
        <CardContent>
          {matchupStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matchup data available</p>
          ) : (
            <div className="space-y-2">
              {matchupStats.map((matchup) => (
                <div key={matchup.opponentDeck} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">{matchup.opponentDeck}</div>
                    <div className="text-sm text-muted-foreground">
                      {matchup.wins}-{matchup.losses}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{matchup.winRate.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

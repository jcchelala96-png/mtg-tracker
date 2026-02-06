import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTournaments } from "@/lib/data";
import {
  calculateOverallStats,
  calculateDeckStats,
  calculatePlayDrawStats,
  calculateMatchupStats,
  calculateWinRateTrend,
} from "@/lib/stats";
import WinRateChart from "@/components/stats/WinRateChart";
import DeckStats from "@/components/stats/DeckStats";

export default function StatsPage() {
  const tournaments = getTournaments();
  const overallStats = calculateOverallStats(tournaments);
  const deckStats = calculateDeckStats(tournaments);
  const playDrawStats = calculatePlayDrawStats(tournaments);
  const matchupStats = calculateMatchupStats(tournaments);
  const winRateTrend = calculateWinRateTrend(tournaments);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Detailed analytics of your tournament performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Record</CardTitle>
            <CardDescription>All-time match performance</CardDescription>
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
            <CardDescription>Win rate comparison</CardDescription>
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
          <CardDescription>Match win percentage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <WinRateChart data={winRateTrend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deck Performance</CardTitle>
          <CardDescription>Win rate by deck</CardDescription>
        </CardHeader>
        <CardContent>
          <DeckStats data={deckStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matchup Matrix</CardTitle>
          <CardDescription>Performance vs opponent decks</CardDescription>
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

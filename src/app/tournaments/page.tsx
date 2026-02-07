import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTournaments } from "@/lib/data";
import { getTournamentSummary } from "@/lib/stats";
import { PlusCircle } from "lucide-react";

export default async function TournamentsPage() {
  const allTournaments = await getTournaments();
  const tournaments = allTournaments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-muted-foreground">View and manage all your tournaments</p>
        </div>
        <Button asChild>
          <Link href="/tournaments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Tournament
          </Link>
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No tournaments yet</p>
            <Button asChild>
              <Link href="/tournaments/new">Create Your First Tournament</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((tournament) => {
            const summary = getTournamentSummary(tournament);
            return (
              <Card key={tournament.id} className="hover:bg-accent transition-colors">
                <Link href={`/tournaments/${tournament.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{tournament.date}</CardTitle>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            tournament.gameType === 'Riftbound'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {tournament.gameType || 'Magic'}
                          </span>
                        </div>
                        <CardDescription>{tournament.location} • {tournament.format}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {summary.matchWins}-{summary.matchLosses}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ({summary.gameWins}-{summary.gameLosses} games)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

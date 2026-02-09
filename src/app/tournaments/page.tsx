import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTournaments, INBOX_ID } from "@/lib/data";
import { getTournamentSummary } from "@/lib/stats";
import { PlusCircle } from "lucide-react";

export default async function TournamentsPage() {
  const allTournaments = await getTournaments();
  const tournaments = allTournaments
    .filter((t) => t.id !== INBOX_ID)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{tournament.date}</CardTitle>
                          <Badge variant={(tournament.gameType || 'Magic') === 'Magic' ? 'default' : 'secondary'}>
                            {tournament.gameType || 'Magic'}
                          </Badge>
                        </div>
                        <CardDescription>{tournament.format}</CardDescription>
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

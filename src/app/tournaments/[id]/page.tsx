"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tournament } from "@/lib/types";
import { getTournamentSummary } from "@/lib/stats";
import MatchCard from "@/components/match/MatchCard";
import MatchForm from "@/components/match/MatchForm";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMatch, setShowAddMatch] = useState(false);

  useEffect(() => {
    loadTournament();
  }, [params.id]);

  async function loadTournament() {
    try {
      const response = await fetch(`/api/tournaments/${params.id}/data`);
      if (response.ok) {
        const data = await response.json();
        setTournament(data);
      }
    } catch (error) {
      console.error("Error loading tournament:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTournament() {
    try {
      await fetch(`/api/tournaments/${params.id}`, { method: "DELETE" });
      router.push("/tournaments");
    } catch (error) {
      console.error("Error deleting tournament:", error);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tournament) {
    return <div>Tournament not found</div>;
  }

  const summary = getTournamentSummary(tournament);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{tournament.date}</h1>
          <p className="text-muted-foreground">{tournament.location} • {tournament.format}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Tournament
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tournament?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this tournament and all its matches. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTournament}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Match Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.matchWins}-{summary.matchLosses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.gameWins}-{summary.gameLosses}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Matches</h2>
          <Button onClick={() => setShowAddMatch(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Match
          </Button>
        </div>

        {tournament.matches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No matches yet. Add your first match to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tournament.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                tournamentId={tournament.id}
                onUpdate={loadTournament}
              />
            ))}
          </div>
        )}
      </div>

      {showAddMatch && (
        <MatchForm
          tournamentId={tournament.id}
          onClose={() => setShowAddMatch(false)}
          onSave={loadTournament}
        />
      )}
    </div>
  );
}

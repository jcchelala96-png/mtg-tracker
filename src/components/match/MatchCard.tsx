"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/lib/types";
import { calculateMatchResult } from "@/lib/stats";
import MatchForm from "./MatchForm";
import { Pencil, Trash2 } from "lucide-react";
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

interface MatchCardProps {
  match: Match;
  tournamentId: string;
  onUpdate: () => void;
}

export default function MatchCard({ match, tournamentId, onUpdate }: MatchCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const result = calculateMatchResult(match);

  async function handleDelete() {
    try {
      await fetch(`/api/tournaments/${tournamentId}/matches?matchId=${match.id}`, {
        method: "DELETE",
      });
      onUpdate();
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                vs {match.opponentName}
                <Badge variant={result.won ? "default" : "destructive"}>
                  {result.wins}-{result.losses}
                </Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {match.myDeck} vs {match.opponentDeck || "Unknown"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Match?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this match. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              {match.games.map((game, index) => (
                <div key={index} className="flex gap-2">
                  <span className="font-medium">Game {index + 1}:</span>
                  <span>{game.onPlay ? "On Play" : "On Draw"}</span>
                  <span>•</span>
                  <span className={game.won ? "text-green-600" : "text-red-600"}>
                    {game.won ? "Won" : "Lost"}
                  </span>
                </div>
              ))}
            </div>
            {match.notes && (
              <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                {match.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {showEdit && (
        <MatchForm
          tournamentId={tournamentId}
          match={match}
          onClose={() => setShowEdit(false)}
          onSave={onUpdate}
        />
      )}
    </>
  );
}

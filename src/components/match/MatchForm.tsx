"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Match } from "@/lib/types";

interface MatchFormProps {
  tournamentId: string;
  match?: Match;
  onClose: () => void;
  onSave: () => void;
}

export default function MatchForm({ tournamentId, match, onClose, onSave }: MatchFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deckNames, setDeckNames] = useState<string[]>([]);
  const [games, setGames] = useState(
    match?.games || [
      { onPlay: true, won: false },
      { onPlay: false, won: false },
    ]
  );

  useEffect(() => {
    fetch("/api/decks")
      .then((res) => res.json())
      .then(setDeckNames)
      .catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const matchData = {
      id: match?.id || crypto.randomUUID(),
      opponentName: formData.get("opponentName") as string,
      myDeck: formData.get("myDeck") as string,
      opponentDeck: formData.get("opponentDeck") as string,
      games,
      notes: formData.get("notes") as string,
    };

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches`, {
        method: match ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        let message = "Failed to save match";
        try {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
        } catch {
          // Ignore non-JSON error payloads
        }
        throw new Error(message);
      }

      onSave();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error saving match";
      console.error("Error saving match:", error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  function toggleGame(index: number, field: "onPlay" | "won") {
    setGames(games.map((g, i) => (i === index ? { ...g, [field]: !g[field] } : g)));
  }

  function addGame() {
    setGames([...games, { onPlay: true, won: false }]);
  }

  function removeGame(index: number) {
    if (games.length > 1) {
      setGames(games.filter((_, i) => i !== index));
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{match ? "Edit Match" : "Add Match"}</DialogTitle>
          <DialogDescription>Enter match details and game results</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opponentName">Opponent Name</Label>
            <Input
              id="opponentName"
              name="opponentName"
              required
              defaultValue={match?.opponentName}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="myDeck">My Deck</Label>
              <Select name="myDeck" defaultValue={match?.myDeck} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type deck..." />
                </SelectTrigger>
                <SelectContent>
                  {deckNames.map((deck) => (
                    <SelectItem key={deck} value={deck}>
                      {deck}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="myDeck"
                placeholder="Or type new deck name"
                className="mt-2"
                defaultValue={match?.myDeck}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opponentDeck">Opponent Deck</Label>
              <Input
                id="opponentDeck"
                name="opponentDeck"
                placeholder="Opponent's deck"
                defaultValue={match?.opponentDeck}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Games</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGame}>
                Add Game
              </Button>
            </div>

            <div className="space-y-2">
              {games.map((game, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded">
                  <span className="font-medium">Game {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={game.onPlay}
                      onCheckedChange={() => toggleGame(index, "onPlay")}
                    />
                    <Label className="text-sm">On the Play</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={game.won}
                      onCheckedChange={() => toggleGame(index, "won")}
                    />
                    <Label className="text-sm">Won</Label>
                  </div>
                  {games.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGame(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Match notes..."
              defaultValue={match?.notes}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : match ? "Update Match" : "Add Match"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

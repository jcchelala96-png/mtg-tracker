"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";

interface Game {
    onPlay: boolean;
    won: boolean;
}

interface Match {
    id: string;
    myDeck: string;
    opponentDeck: string;
    games: Game[];
    notes?: string;
}

interface InboxMatchFormProps {
    match: Match;
    deckNames: string[];
    onSave: (updatedMatch: Match) => Promise<void>;
    onDelete: (matchId: string) => Promise<void>;
    onCancel: () => void;
}

export function InboxMatchForm({ match, deckNames, onSave, onDelete, onCancel }: InboxMatchFormProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [myDeck, setMyDeck] = useState(match.myDeck);
    const [opponentDeck, setOpponentDeck] = useState(match.opponentDeck);
    const [notes, setNotes] = useState(match.notes || "");

    const [games, setGames] = useState<Game[]>(match.games);

    const handleGameChange = (index: number, field: keyof Game, value: boolean) => {
        const newGames = [...games];
        newGames[index] = { ...newGames[index], [field]: value };
        setGames(newGames);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...match,
                myDeck,
                opponentDeck,
                games,
                notes,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="edit-my-deck">My Deck</Label>
                <Input
                    id="edit-my-deck"
                    list="edit-deck-list"
                    value={myDeck}
                    onChange={(e) => setMyDeck(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-opponent-deck">Opponent Deck</Label>
                <Input
                    id="edit-opponent-deck"
                    list="edit-deck-list"
                    value={opponentDeck}
                    onChange={(e) => setOpponentDeck(e.target.value)}
                    required
                />
            </div>

            <datalist id="edit-deck-list">
                {deckNames.map(d => <option key={d} value={d} />)}
            </datalist>

            <div className="space-y-3">
                <Label>Games</Label>
                {games.map((game, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <span className="font-medium">Game {i + 1}</span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`play-${i}`}
                                    checked={game.onPlay}
                                    onCheckedChange={(checked) => handleGameChange(i, "onPlay", checked === true)}
                                />
                                <Label htmlFor={`play-${i}`} className="text-sm cursor-pointer">On Play</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`won-${i}`}
                                    checked={game.won}
                                    onCheckedChange={(checked) => handleGameChange(i, "won", checked === true)}
                                />
                                <Label htmlFor={`won-${i}`} className="text-sm cursor-pointer">Won</Label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                    id="edit-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Match notes..."
                    className="min-h-[80px]"
                />
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={loading || deleting}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading || deleting}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                            setDeleting(true);
                            onDelete(match.id).finally(() => setDeleting(false));
                        }}
                        disabled={loading || deleting}
                    >
                        {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Delete
                    </Button>
                </div>
            </div>
        </form>
    );
}

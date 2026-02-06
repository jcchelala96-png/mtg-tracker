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
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { Loader2, Check } from "lucide-react";

const RESULT_OPTIONS = ["2-0", "2-1", "1-2", "0-2", "1-0", "0-1"];

interface QuickAddDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function QuickAddDialog({ open, onOpenChange, onSuccess }: QuickAddDialogProps) {
    const { performMutation, isOnline } = useOfflineMutation();
    const [deckNames, setDeckNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [myDeck, setMyDeck] = useState("");
    const [opponentDeck, setOpponentDeck] = useState("");
    const [onPlay, setOnPlay] = useState(true);
    const [result, setResult] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) {
            fetch("/api/quick-add")
                .then(res => res.json())
                .then(data => setDeckNames(data.deckNames || []))
                .catch(() => { });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!myDeck || !opponentDeck || !result) return;

        setLoading(true);
        try {
            const data = await performMutation("/api/quick-add", "POST", {
                myDeck, opponentDeck, onPlay, result, notes
            });

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    setMyDeck("");
                    setOpponentDeck("");
                    setOnPlay(true);
                    setResult("");
                    setNotes("");
                    setSuccess(false);
                    setLoading(false);
                    onOpenChange(false);
                    onSuccess?.();
                }, 1000);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Quick Add Result</DialogTitle>
                    <DialogDescription>
                        Add a match result. It will appear in your inbox for organization later.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {/* My Deck */}
                    <div className="space-y-2">
                        <Label htmlFor="quick-my-deck">My Deck</Label>
                        <Input
                            id="quick-my-deck"
                            list="quick-deck-list"
                            value={myDeck}
                            onChange={(e) => setMyDeck(e.target.value)}
                            placeholder="e.g., Mono Red Aggro"
                            required
                        />
                    </div>

                    {/* Opponent Deck */}
                    <div className="space-y-2">
                        <Label htmlFor="quick-opponent-deck">Opponent Deck</Label>
                        <Input
                            id="quick-opponent-deck"
                            list="quick-deck-list"
                            value={opponentDeck}
                            onChange={(e) => setOpponentDeck(e.target.value)}
                            placeholder="e.g., Control"
                            required
                        />
                    </div>

                    <datalist id="quick-deck-list">
                        {deckNames.map(d => <option key={d} value={d} />)}
                    </datalist>

                    {/* On Play Checkbox */}
                    <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                            id="quick-onPlay"
                            checked={onPlay}
                            onCheckedChange={(checked) => setOnPlay(checked === true)}
                        />
                        <Label htmlFor="quick-onPlay" className="font-medium leading-none cursor-pointer">
                            I started on the Play
                        </Label>
                    </div>

                    {/* Result */}
                    <div className="space-y-2">
                        <Label>Result</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {RESULT_OPTIONS.map(r => (
                                <Button
                                    key={r}
                                    type="button"
                                    variant={result === r ? "default" : "outline"}
                                    className="font-semibold"
                                    onClick={() => setResult(r)}
                                >
                                    {r}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="quick-notes">Notes (optional)</Label>
                        <Textarea
                            id="quick-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Match notes..."
                            className="min-h-[80px]"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !myDeck || !opponentDeck || !result}
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {success && <Check className="h-4 w-4 mr-2" />}
                        {success ? "Saved!" : "Save Result"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

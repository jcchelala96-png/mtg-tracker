"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ArrowLeft, Loader2 } from "lucide-react";

const RESULT_OPTIONS = ["2-0", "2-1", "1-2", "0-2", "1-0", "0-1"];

export default function QuickAddPage() {
    const router = useRouter();
    const [deckNames, setDeckNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [myDeck, setMyDeck] = useState("");
    const [opponentDeck, setOpponentDeck] = useState("");
    const [onPlay, setOnPlay] = useState(true);
    const [result, setResult] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetch("/api/quick-add")
            .then(res => res.json())
            .then(data => setDeckNames(data.deckNames || []))
            .catch(() => { });
    }, []);

    const handleSubmit = async () => {
        if (!myDeck || !opponentDeck || !result) return;

        setLoading(true);
        try {
            const res = await fetch("/api/quick-add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ myDeck, opponentDeck, onPlay, result, notes }),
            });
            if (res.ok) {
                setSuccess(true);
                // Reset form after brief delay
                setTimeout(() => {
                    setMyDeck("");
                    setOpponentDeck("");
                    setOnPlay(true);
                    setResult("");
                    setNotes("");
                    setSuccess(false);
                }, 1500);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4">
            <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="self-start mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle className="text-2xl">Quick Add Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* My Deck */}
                    <div className="space-y-2">
                        <Label htmlFor="myDeck" className="text-base">My Deck</Label>
                        <Input
                            id="myDeck"
                            list="myDeckList"
                            value={myDeck}
                            onChange={(e) => setMyDeck(e.target.value)}
                            placeholder="e.g., Mono Red Aggro"
                            className="h-12 text-lg"
                        />
                        <datalist id="myDeckList">
                            {deckNames.map(d => <option key={d} value={d} />)}
                        </datalist>
                    </div>

                    {/* Opponent Deck */}
                    <div className="space-y-2">
                        <Label htmlFor="opponentDeck" className="text-base">Opponent Deck</Label>
                        <Input
                            id="opponentDeck"
                            list="opponentDeckList"
                            value={opponentDeck}
                            onChange={(e) => setOpponentDeck(e.target.value)}
                            placeholder="e.g., Control"
                            className="h-12 text-lg"
                        />
                        <datalist id="opponentDeckList">
                            {deckNames.map(d => <option key={d} value={d} />)}
                        </datalist>
                    </div>

                    {/* On Play Checkbox */}
                    <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                            id="onPlay"
                            checked={onPlay}
                            onCheckedChange={(checked) => setOnPlay(checked === true)}
                            className="h-6 w-6"
                        />
                        <Label htmlFor="onPlay" className="text-lg font-medium leading-none cursor-pointer">
                            I started on the Play
                        </Label>
                    </div>

                    {/* Result */}
                    <div className="space-y-2">
                        <Label className="text-base">Result</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {RESULT_OPTIONS.map(r => (
                                <Button
                                    key={r}
                                    type="button"
                                    variant={result === r ? "default" : "outline"}
                                    className="h-14 text-lg font-semibold"
                                    onClick={() => setResult(r)}
                                >
                                    {r}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-base">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any notes about this match..."
                            className="min-h-[80px] text-base"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !myDeck || !opponentDeck || !result}
                        className="w-full h-14 text-lg"
                        size="lg"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : success ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Saved!
                            </>
                        ) : (
                            "Save Result"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

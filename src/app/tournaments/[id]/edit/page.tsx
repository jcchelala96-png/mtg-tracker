"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tournament } from "@/lib/types";

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [gameType, setGameType] = useState<'Magic' | 'Riftbound'>('Magic');

    useEffect(() => {
        loadTournament();
    }, [id]);

    async function loadTournament() {
        try {
            const response = await fetch(`/api/tournaments/${id}/data`);
            if (response.ok) {
                const data = await response.json();
                setTournament(data);
                setGameType(data.gameType || 'Magic');
            }
        } catch (error) {
            console.error("Error loading tournament:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!tournament) return;

        setSaving(true);

        const formData = new FormData(e.currentTarget);
        const updatedTournament: Tournament = {
            ...tournament,
            date: formData.get("date") as string,
            location: formData.get("location") as string,
            format: formData.get("format") as string,
            gameType: gameType,
        };

        try {
            const response = await fetch(`/api/tournaments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTournament),
            });

            if (response.ok) {
                router.push(`/tournaments/${id}`);
            }
        } catch (error) {
            console.error("Error updating tournament:", error);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!tournament) {
        return <div>Tournament not found</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Edit Tournament</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Tournament Details</CardTitle>
                    <CardDescription>Update your tournament information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                defaultValue={tournament.date}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="Local Game Store"
                                required
                                defaultValue={tournament.location}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gameType">Game Type</Label>
                            <Select value={gameType} onValueChange={(value) => setGameType(value as 'Magic' | 'Riftbound')}>
                                <SelectTrigger id="gameType">
                                    <SelectValue placeholder="Select game type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Magic">Magic</SelectItem>
                                    <SelectItem value="Riftbound">Riftbound</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="format">Format</Label>
                            <Input
                                id="format"
                                name="format"
                                placeholder="Modern"
                                required
                                defaultValue={tournament.format}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

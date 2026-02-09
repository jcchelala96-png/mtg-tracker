"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Match {
    id: string;
    myDeck: string;
    opponentDeck: string;
    games: { onPlay: boolean; won: boolean }[];
}

interface DraggableMatchProps {
    match: Match;
    onEdit: (match: Match) => void;
}

export function DraggableMatch({ match, onEdit }: DraggableMatchProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: match.id,
        data: { match },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const wins = match.games.filter((g) => g.won).length;
    const losses = match.games.filter((g) => !g.won).length;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 rounded-lg bg-background cursor-grab active:cursor-grabbing touch-none select-none ${isDragging ? "ring-2 ring-primary shadow-lg z-50" : "hover:bg-accent/50"
                }`}
            {...listeners}
            {...attributes}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 -m-1 touch-none">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <span className="font-medium">{match.myDeck}</span>
                    <span className="text-muted-foreground"> vs </span>
                    <span>{match.opponentDeck}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={wins > losses ? "default" : "destructive"}>
                    {wins}-{losses}
                </Badge>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(match);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Edit2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

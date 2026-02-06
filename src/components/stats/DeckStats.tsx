"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DeckStats as DeckStatsType } from "@/lib/types";

interface DeckStatsProps {
  data: DeckStatsType[];
}

export default function DeckStats({ data }: DeckStatsProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No deck data available</p>;
  }

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="deckName" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="winRate" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

import { getTournaments, getInboxMatches, INBOX_ID } from "@/lib/data";
import { calculateOverallStats, getTournamentSummary } from "@/lib/stats";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allTournaments = await getTournaments();
  const tournaments = allTournaments.filter(t => t.id !== INBOX_ID);
  const inboxMatches = await getInboxMatches();
  const stats = calculateOverallStats(tournaments);
  const recentTournaments = tournaments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Prepare tournament summaries for DnD
  const tournamentSummaries = recentTournaments.map(t => {
    const summary = getTournamentSummary(t);
    return {
      id: t.id,
      date: t.date,
      location: t.location,
      gameType: t.gameType || 'Magic' as 'Magic' | 'Riftbound',
      matchWins: summary.matchWins,
      matchLosses: summary.matchLosses,
      gameWins: summary.gameWins,
      gameLosses: summary.gameLosses,
    };
  });

  return (
    <DashboardClient
      tournaments={tournaments}
      inboxMatches={inboxMatches}
      stats={stats}
      tournamentSummaries={tournamentSummaries}
    />
  );
}

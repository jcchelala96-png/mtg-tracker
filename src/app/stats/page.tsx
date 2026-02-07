import { getTournaments, INBOX_ID } from "@/lib/data";
import StatsDashboard from "@/components/stats/StatsDashboard";

export default async function StatsPage() {
  const allTournaments = await getTournaments();
  const tournaments = allTournaments.filter(t => t.id !== INBOX_ID);

  return <StatsDashboard initialTournaments={tournaments} />;
}

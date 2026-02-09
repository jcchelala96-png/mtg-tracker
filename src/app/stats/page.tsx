import { getTournaments } from "@/lib/data";
import StatsDashboard from "@/components/stats/StatsDashboard";

export default async function StatsPage() {
  const tournaments = await getTournaments();

  return <StatsDashboard tournaments={tournaments} />;
}

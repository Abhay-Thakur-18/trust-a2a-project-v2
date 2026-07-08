import StatCard from "./StatCard";
import { stats } from "../../constants/dashboardData";

function StatsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  );
}

export default StatsGrid;
import TaskStatusDistribution from "./TaskStatusDistribution";
import VerificationTrendChart from "./VerificationTrendChart";

function ChartSection({ tasks = [], verifications = [] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TaskStatusDistribution tasks={tasks} />
      <VerificationTrendChart verifications={verifications} />
    </div>
  );
}

export default ChartSection;

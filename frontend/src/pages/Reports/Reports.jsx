import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getReportsData } from "../../services/reportsService";
import ReportViewer from "../../components/shared/ReportViewer";
import PageHeader from "../../components/shared/PageHeader";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import TaskStatusDistribution from "../../components/charts/TaskStatusDistribution";
import VerificationTrendChart from "../../components/charts/VerificationTrendChart";
import EscrowThroughputChart from "../../components/charts/EscrowThroughputChart";

function Reports() {
  const { data, loading, error, refetch } = useApiQuery(getReportsData);

  const reports = useMemo(() => data?.reports || [], [data]);
  const verifications = useMemo(() => data?.verifications || [], [data]);
  const tasks = useMemo(() => data?.tasks || [], [data]);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        description="Analytics, escrow throughput, and detailed worker reports."
        actionLabel="Refresh"
        onAction={() => refetch()}
        actionIcon={RefreshCw}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <VerificationTrendChart verifications={verifications} />
        <TaskStatusDistribution tasks={tasks} />
        <EscrowThroughputChart transactions={data?.transactions || []} className="xl:col-span-2" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generated Reports</h2>
          <span className="text-sm text-muted-foreground">{reports.length} total</span>
        </div>
        {!reports.length ? (
          <EmptyState title="No reports generated yet" description="Worker agent generates reports when tasks are created." />
        ) : (
          <div className="stagger-children space-y-4">
            {reports.map((task) => (
              <ReportViewer key={task.task_id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Reports;

import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getWorkers } from "../../services/workerService";
import { getAllReputations } from "../../services/reputationService";
import ReportViewer from "../../components/shared/ReportViewer";
import ReputationCard from "../../components/shared/ReputationCard";
import StatusBadge from "../../components/shared/StatusBadge";
import { formatCurrency } from "../../lib/formatters";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";

function Workers() {
  const { data, loading, error, refetch } = useApiQuery(async () => {
    const [workersData, reputations] = await Promise.all([getWorkers(), getAllReputations()]);
    return { ...workersData, reputations };
  });

  if (loading) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  const workers = data?.workers || [];
  const assignments = data?.assignments || [];
  const reports = assignments.filter((a) => a.generated_report);
  const reputations = data?.reputations?.length
    ? data.reputations
    : workers.map((w) => ({
        agent_id: w.worker_id,
        score: w.reputation_score ?? 100,
        success_count: w.success_count ?? 0,
        failure_count: w.failure_count ?? 0,
        success_rate: w.tasks_total
          ? Math.round(((w.tasks_completed || 0) / w.tasks_total) * 100)
          : 100,
      }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workers</h1>
          <p className="text-sm text-muted-foreground">Live worker performance, reputation, and generated reports.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reputations.map((rep) => (
          <ReputationCard key={rep.agent_id} reputation={rep} />
        ))}
      </div>

      {!reputations.length ? (
        <EmptyState title="No worker reputation yet" description="Create and verify a task to build worker reputation." />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Worker Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {!assignments.length ? (
            <EmptyState title="No assignments" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.task_id}>
                    <TableCell className="max-w-[200px] truncate">{a.task}</TableCell>
                    <TableCell className="whitespace-nowrap">{a.worker_id}</TableCell>
                    <TableCell className="whitespace-nowrap"><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="whitespace-nowrap">{a.verification_score ?? "-"}</TableCell>
                    <TableCell className="max-w-[320px] whitespace-normal break-words text-sm leading-relaxed">{a.verification_feedback || "-"}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(a.reward)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Worker Reports ({reports.length})</h2>
        {!reports.length ? (
          <EmptyState title="No reports yet" description="Reports appear here after tasks complete." />
        ) : (
          reports.map((task) => <ReportViewer key={task.task_id} task={task} />)
        )}
      </div>
    </div>
  );
}

export default Workers;

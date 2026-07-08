import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getTasks } from "../../services/taskService";
import CreateTaskForm from "../../components/shared/CreateTaskForm";
import StatusBadge from "../../components/shared/StatusBadge";
import { formatCurrency } from "../../lib/formatters";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";

function Tasks() {
  const [version, setVersion] = useState(0);
  const { data, loading, error, refetch } = useApiQuery(getTasks, { immediate: true });

  const tasks = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const refresh = () => {
    setVersion((v) => v + 1);
    refetch();
  };

  if (loading && !data) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorState onRetry={refresh} />;

  return (
    <div className="space-y-6" key={version}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">Create, monitor, and track task lifecycle across agents.</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <CreateTaskForm onSuccess={refresh} />

      <Card>
        <CardHeader>
          <CardTitle>Task Queue ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {!tasks.length ? (
            <EmptyState title="No tasks yet" description="Create your first task using the form above." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.task_id}>
                    <TableCell className="max-w-[140px] truncate font-mono text-xs">{task.task_id}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{task.task}</TableCell>
                    <TableCell><StatusBadge status={task.status} /></TableCell>
                    <TableCell>{task.worker_id || "-"}</TableCell>
                    <TableCell>{task.verification_score ?? "-"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(task.reward)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Tasks;

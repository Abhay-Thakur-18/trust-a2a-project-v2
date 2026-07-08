import { useMemo, useState } from "react";
import { Activity, CircleCheck, Clock3, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import MetricCard from "../../components/shared/MetricCard";
import StatusBadge from "../../components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getDashboardSnapshot } from "../../services/dashboardService";
import { formatCurrency } from "../../lib/formatters";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import TaskStatusDistribution from "../../components/charts/TaskStatusDistribution";
import VerificationTrendChart from "../../components/charts/VerificationTrendChart";
import EscrowThroughputChart from "../../components/charts/EscrowThroughputChart";
import EscrowStatusChart from "../../components/charts/EscrowStatusChart";
import ReputationCard from "../../components/shared/ReputationCard";

function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading, error, refetch } = useApiQuery(
    () => getDashboardSnapshot(),
    { immediate: true },
  );

  const transactions = useMemo(() => data?.transactions || [], [data]);
  const tasks = useMemo(() => data?.tasks || [], [data]);
  const verifications = useMemo(() => data?.verifications || [], [data]);
  const reputationScore = data?.reputation?.score ?? 100;

  const verifiedCount = useMemo(
    () => tasks.filter((t) => ["verified", "paid"].includes(String(t?.status).toLowerCase())).length,
    [tasks],
  );
  const pendingCount = useMemo(
    () => tasks.filter((t) => ["created", "processing", "locked"].includes(String(t?.status).toLowerCase())).length,
    [tasks],
  );
  const lockedEscrow = data?.escrow?.locked_balance ?? data?.escrow?.balance ?? 0;

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    refetch();
  };

  if (loading && !data) return <LoadingSkeleton rows={8} />;

  const isEmpty = !tasks.length && !transactions.length;

  return (
    <div className="space-y-6 animate-fade-in" key={refreshKey}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {isEmpty
              ? "Fresh start — all metrics are zero until you create your first task."
              : "Live control center for your Trust A2A agent network."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {error ? <ErrorState title="Some dashboard data failed to load" onRetry={handleRefresh} /> : null}

      <div className="stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Tasks" value={tasks.length} icon={Activity} delta={tasks.length ? "From database" : "No tasks yet"} />
        <MetricCard title="Verified Tasks" value={verifiedCount} icon={CircleCheck} tone="success" />
        <MetricCard title="Pending Tasks" value={pendingCount} icon={Clock3} tone="warning" />
        <MetricCard
          title="Locked in Escrow"
          value={formatCurrency(lockedEscrow)}
          icon={Wallet}
          delta={lockedEscrow > 0 ? `${transactions.filter((t) => t.status === "locked").length} active locks` : "No locked funds"}
          tone={lockedEscrow > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TaskStatusDistribution tasks={tasks} className="animate-fade-in-up" />
        <VerificationTrendChart verifications={verifications} className="animate-fade-in-up" />
        <EscrowThroughputChart transactions={transactions} className="animate-fade-in-up" />
        <EscrowStatusChart transactions={transactions} className="animate-fade-in-up" />
      </div>

      {data?.reputation ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ReputationCard reputation={data.reputation} />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions.length ? (
              <EmptyState title="No escrow transactions" description="Funds will appear here after you create a task." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 8).map((item, index) => (
                    <TableRow key={item?.id || index} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                      <TableCell className="max-w-[180px] truncate font-mono text-xs">{item?.task_id || "-"}</TableCell>
                      <TableCell><StatusBadge status={item?.status} /></TableCell>
                      <TableCell>{item?.created_at?.slice(0, 10) || "-"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item?.amount || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: "80ms" }}>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["Client Agent", data?.clientOverview?.status === "running"],
              ["Worker Agent", data?.workerOverview?.status === "running"],
              ["Escrow Service", data?.escrowOverview?.status === "running"],
            ].map(([label, online], index) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span>{label}</span>
                <span className={online ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}>
                  {online ? "Online" : "Checking..."}
                </span>
              </div>
            ))}
            <div className="rounded-lg border border-border/60 px-3 py-2">
              <div className="flex items-center justify-between">
                <span>Worker Trust Score</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck size={14} /> {reputationScore}%
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Success {data?.reputation?.success_count ?? 0} · Failures {data?.reputation?.failure_count ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;

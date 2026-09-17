import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Wallet,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MetricCard from "../../components/shared/MetricCard";
import StatusBadge from "../../components/shared/StatusBadge";
import ServiceHealthGrid from "../../components/shared/ServiceHealthGrid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getDashboardSnapshot } from "../../services/dashboardService";
import { formatCurrency } from "../../lib/formatters";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import TaskStatusDistribution from "../../components/charts/TaskStatusDistribution";
import ReputationCard from "../../components/shared/ReputationCard";

function Dashboard() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const { data, loading, error, refetch } = useApiQuery(
    () => getDashboardSnapshot(),
    { immediate: true },
  );

  const transactions = useMemo(() => data?.transactions || [], [data]);
  const tasks = useMemo(() => data?.tasks || [], [data]);
  const verifications = useMemo(() => data?.verifications || [], [data]);
  const reputation = data?.reputation;

  const completedCount = useMemo(
    () => tasks.filter((t) => ["completed", "verified", "paid"].includes(String(t?.status).toLowerCase())).length,
    [tasks],
  );
  const pendingCount = useMemo(
    () => tasks.filter((t) => ["created", "processing", "locked"].includes(String(t?.status).toLowerCase())).length,
    [tasks],
  );
  const lockedEscrow = data?.escrow?.locked_balance ?? data?.escrow?.balance ?? 0;

  const copyTaskId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading && !data) return <LoadingSkeleton rows={8} />;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor tasks, agents, verification and escrow activity.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3.5 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Refresh
          </Button>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            Create Task
          </Link>
        </div>
      </div>

      {error ? <ErrorState title="Some dashboard metrics failed to load" onRetry={() => refetch()} /> : null}

      {/* ── 4-Column KPI Section ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={tasks.length}
          icon={Activity}
          delta={tasks.length ? `${tasks.length} total tasks registered` : "No tasks created"}
          tone="default"
        />
        <MetricCard
          title="Pending Tasks"
          value={pendingCount}
          icon={Clock3}
          delta={pendingCount ? `${pendingCount} in flight` : "Queue clear"}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Completed Tasks"
          value={completedCount}
          icon={CheckCircle2}
          delta={tasks.length ? `${Math.round((completedCount / tasks.length) * 100)}% completion rate` : "0% completion"}
          tone="success"
        />
        <MetricCard
          title="Locked in Escrow"
          value={formatCurrency(lockedEscrow)}
          icon={Wallet}
          delta={lockedEscrow > 0 ? `${transactions.filter((t) => t.status === "locked").length} locks active` : "Zero locked balance"}
          tone={lockedEscrow > 0 ? "warning" : "default"}
        />
      </div>

      {/* ── System Health Section ── */}
      <ServiceHealthGrid snapshot={data} />

      {/* ── Task Analytics: 2-Column Section (Distribution + Recent Tasks Table) ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Task Status Distribution */}
        <div className="lg:col-span-5">
          <TaskStatusDistribution tasks={tasks} className="h-full" />
        </div>

        {/* RIGHT: Recent Tasks Table */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-200 bg-white shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Recent Tasks</CardTitle>
                <CardDescription className="text-xs text-slate-500">Latest orchestrated tasks in the pipeline</CardDescription>
              </div>
              <Link to="/tasks" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {!tasks.length ? (
                <div className="p-8">
                  <EmptyState title="No tasks found" description="Create a task to initiate multi-agent orchestration." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-100 bg-slate-50/40 text-xs">
                        <TableHead className="py-3 px-4 font-bold text-slate-700">Task</TableHead>
                        <TableHead className="py-3 px-3 font-bold text-slate-700">Status</TableHead>
                        <TableHead className="py-3 px-3 font-bold text-slate-700">Reward</TableHead>
                        <TableHead className="py-3 px-3 font-bold text-slate-700">Created</TableHead>
                        <TableHead className="py-3 px-4 text-right font-bold text-slate-700">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.slice(0, 5).map((task) => (
                        <TableRow
                          key={task.task_id}
                          className="border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors text-xs"
                          onClick={() => navigate(`/tasks`)}
                        >
                          <TableCell className="py-3 px-4 max-w-[220px]">
                            <p className="font-semibold text-slate-900 truncate" title={task.task}>
                              {task.task}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-400">
                                {task.task_id?.slice(0, 14)}…
                              </span>
                              <button
                                type="button"
                                onClick={(e) => copyTaskId(task.task_id, e)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                                title="Copy Task ID"
                              >
                                {copiedId === task.task_id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <StatusBadge status={task.status} />
                          </TableCell>
                          <TableCell className="py-3 px-3 font-bold text-slate-900">
                            {formatCurrency(task.reward)}
                          </TableCell>
                          <TableCell className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {task.created_at ? task.created_at.slice(0, 10) : "Today"}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <Link
                              to="/tasks"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              Details
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Autonomous Worker Reputation & Verification Highlight ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Worker Trust Score */}
        <div className="lg:col-span-1">
          {reputation ? (
            <ReputationCard reputation={reputation} />
          ) : (
            <Card className="border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Worker Trust Score</span>
                <ShieldCheck size={18} className="text-emerald-600" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">100%</p>
              <p className="mt-1 text-xs text-slate-500">Autonomous worker agent operational with top tier reputation.</p>
            </Card>
          )}
        </div>

        {/* Recent Escrow Ledger Activity */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Recent Escrow Ledger</CardTitle>
                <CardDescription className="text-xs text-slate-500">Immutable settlement records</CardDescription>
              </div>
              <Link to="/transactions" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View Ledger ({transactions.length}) <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {!transactions.length ? (
                <div className="p-6">
                  <EmptyState title="No transactions yet" description="Escrow locks and releases will appear here." />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/40 text-xs">
                      <TableHead className="py-2.5 px-4 font-bold text-slate-700">Task Reference</TableHead>
                      <TableHead className="py-2.5 px-3 font-bold text-slate-700">Status</TableHead>
                      <TableHead className="py-2.5 px-3 font-bold text-slate-700">Date</TableHead>
                      <TableHead className="py-2.5 px-4 text-right font-bold text-slate-700">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 4).map((item, index) => (
                      <TableRow key={item?.id || index} className="border-b border-slate-100 hover:bg-slate-50 text-xs">
                        <TableCell className="max-w-[200px] truncate font-mono text-slate-600 py-2.5 px-4">
                          {item?.task_id || "-"}
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          <StatusBadge status={item?.status} />
                        </TableCell>
                        <TableCell className="text-slate-500 py-2.5 px-3">
                          {item?.created_at?.slice(0, 10) || "Recent"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 py-2.5 px-4">
                          {formatCurrency(item?.amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

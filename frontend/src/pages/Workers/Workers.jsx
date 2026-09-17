import { useMemo, useState } from "react";
import { RefreshCw, Users, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, FileText, Cpu, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getWorkers } from "../../services/workerService";
import { getAllReputations } from "../../services/reputationService";
import ReportViewer from "../../components/shared/ReportViewer";
import StatusBadge from "../../components/shared/StatusBadge";
import MetricCard from "../../components/shared/MetricCard";
import { formatCurrency } from "../../lib/formatters";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import { Link } from "react-router-dom";

function Workers() {
  const { data, loading, error, refetch } = useApiQuery(async () => {
    const [workersData, reputations] = await Promise.all([getWorkers(), getAllReputations()]);
    return { ...workersData, reputations };
  });

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  const workers = data?.workers || [];
  const assignments = data?.assignments || [];
  const reports = assignments.filter((a) => a.generated_report);
  
  const reputations = data?.reputations?.length
    ? data.reputations
    : workers.map((w) => ({
        agent_id: w.worker_id || "worker-agent",
        score: w.reputation_score ?? 100,
        success_count: w.success_count ?? (w.tasks_completed || 0),
        failure_count: w.failure_count ?? 0,
        success_rate: w.tasks_total
          ? Math.round(((w.tasks_completed || 0) / w.tasks_total) * 100)
          : 100,
      }));

  // Summary Metrics calculations
  const totalWorkers = reputations.length || 1;
  const activeWorkers = reputations.length || 1;
  const avgReputation = Math.round(
    reputations.reduce((acc, curr) => acc + (curr.score ?? 100), 0) / (reputations.length || 1),
  );
  const totalSuccesses = reputations.reduce((acc, curr) => acc + (curr.success_count || 0), 0);
  const totalFailures = reputations.reduce((acc, curr) => acc + (curr.failure_count || 0), 0);
  const overallSuccessRate =
    totalSuccesses + totalFailures > 0
      ? Math.round((totalSuccesses / (totalSuccesses + totalFailures)) * 100)
      : 100;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Worker Agents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage autonomous agent fleet, reputation metrics, and execution history.
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
            Refresh Fleet
          </Button>
        </div>
      </div>

      {/* ── Top Summary KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Worker Agents"
          value={totalWorkers}
          icon={Users}
          delta="Registered autonomous nodes"
          tone="default"
        />
        <MetricCard
          title="Active Agents"
          value={activeWorkers}
          icon={Cpu}
          delta="Online & accepting dispatch"
          tone="success"
        />
        <MetricCard
          title="Average Reputation"
          value={`${avgReputation}%`}
          icon={ShieldCheck}
          delta="Cryptographic trust score"
          tone="success"
        />
        <MetricCard
          title="Success Rate"
          value={`${overallSuccessRate}%`}
          icon={TrendingUp}
          delta={`${totalSuccesses} passed · ${totalFailures} failed`}
          tone={overallSuccessRate >= 80 ? "success" : "warning"}
        />
      </div>

      {/* ── Agent Management Cards ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-slate-900">Agent Fleet Nodes</h2>
          <span className="text-xs text-slate-500">{reputations.length} Active Nodes</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reputations.map((rep) => {
            const agentAssignments = assignments.filter((a) => (a.worker_id || "worker-agent") === rep.agent_id);
            const agentReports = agentAssignments.filter((a) => a.generated_report);

            return (
              <div
                key={rep.agent_id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Agent Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                        <Cpu size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{rep.agent_id}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-medium text-slate-500">Autonomous LLM Worker</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs">
                      ● Online
                    </span>
                  </div>

                  {/* Prominent Reputation Score */}
                  <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/80 p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reputation Score</span>
                      <p className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                        {rep.score ?? 100}<span className="text-sm font-normal text-slate-400">/100</span>
                      </p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                  {/* Operational Metrics Grid */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg border border-slate-200/80 bg-white p-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Success Rate</span>
                      <span className="font-bold text-slate-900">{rep.success_rate ?? 100}%</span>
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-white p-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Failures</span>
                      <span className="font-bold text-rose-600">{rep.failure_count ?? 0}</span>
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-white p-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deliverables</span>
                      <span className="font-bold text-slate-900">{agentReports.length || reports.length}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{agentAssignments.length || assignments.length} assignments executed</span>
                  <span className="font-semibold text-blue-600">Verified Node</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Worker Assignments Table ── */}
      <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Task Assignments</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {assignments.length} total assignment{assignments.length !== 1 ? "s" : ""} dispatched across agent fleet
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
            {assignments.length} Records
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {!assignments.length ? (
            <div className="p-8">
              <EmptyState title="No worker assignments found" description="Create a task to dispatch jobs to worker agents." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/60 text-xs">
                    <TableHead className="py-3.5 px-4 font-bold text-slate-700 min-w-[260px]">Task Objective</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700">Assigned Node</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700">Execution Status</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700">Quality Score</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[220px]">Audit Feedback</TableHead>
                    <TableHead className="py-3.5 px-4 text-right font-bold text-slate-700">Escrow Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.task_id} className="border-b border-slate-100 hover:bg-slate-50 text-xs">
                      <TableCell className="py-3.5 px-4 max-w-[260px]">
                        <p className="font-semibold text-slate-900 leading-snug">{a.task}</p>
                        <p className="font-mono text-[11px] text-slate-400 mt-0.5">{a.task_id}</p>
                      </TableCell>
                      <TableCell className="py-3.5 px-3 font-mono text-slate-700">
                        {a.worker_id || "worker-agent"}
                      </TableCell>
                      <TableCell className="py-3.5 px-3">
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="py-3.5 px-3">
                        {a.verification_score != null ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            Number(a.verification_score) >= 80
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {a.verification_score}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 px-3 max-w-[260px] truncate text-slate-600" title={a.verification_feedback}>
                        {a.verification_feedback || "Pending independent verifier audit"}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(a.reward)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Deliverables Stream ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">Generated Research Deliverables</h2>
            <p className="text-xs text-slate-500">Structured deliverables produced by worker agent LLM</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{reports.length} Reports Published</span>
        </div>

        {!reports.length ? (
          <EmptyState title="No deliverables generated yet" description="Execute tasks to see AI worker deliverables appear here." />
        ) : (
          <div className="space-y-4">
            {reports.map((task) => <ReportViewer key={task.task_id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default Workers;

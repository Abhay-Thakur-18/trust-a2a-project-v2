import { useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  PlusCircle,
  X,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileText,
  IndianRupee,
  Clock,
  User,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getTasks } from "../../services/taskService";
import CreateTaskForm from "../../components/shared/CreateTaskForm";
import StatusBadge from "../../components/shared/StatusBadge";
import { formatCurrency } from "../../lib/formatters";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import { Link } from "react-router-dom";

function Tasks() {
  const [version, setVersion] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { data, loading, error, refetch } = useApiQuery(getTasks, { immediate: true });

  const rawTasks = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const refresh = () => {
    setVersion((v) => v + 1);
    refetch();
  };

  const copyTaskId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredTasks = useMemo(() => {
    return rawTasks.filter((task) => {
      const matchesSearch =
        !searchTerm.trim() ||
        task.task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.worker_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        String(task.status).toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawTasks, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: rawTasks.length, created: 0, processing: 0, completed: 0, paid: 0, failed: 0 };
    rawTasks.forEach((t) => {
      const s = String(t.status || "").toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
      if (["verified", "completed"].includes(s)) counts.completed++;
    });
    return counts;
  }, [rawTasks]);

  if (loading && !data) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={refresh} />;

  return (
    <div className="space-y-6" key={version}>
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and monitor agent tasks.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="h-9 px-3.5 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateForm((v) => !v)}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <PlusCircle size={15} className="mr-1.5" />
            {showCreateForm ? "Close Form" : "Create Task"}
          </Button>
        </div>
      </div>

      {/* ── Create Task Drawer / Collapsible Form ── */}
      {showCreateForm && (
        <div className="animate-fade-in">
          <CreateTaskForm
            onSuccess={() => {
              refresh();
            }}
          />
        </div>
      )}

      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by task title, task ID, or worker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          {[
            { id: "all", label: "All" },
            { id: "created", label: "Created" },
            { id: "processing", label: "Processing" },
            { id: "completed", label: "Completed" },
            { id: "paid", label: "Paid" },
            { id: "failed", label: "Failed" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Data Management Table ── */}
      <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Task Register</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Showing {filteredTasks.length} of {rawTasks.length} total tasks
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
            {filteredTasks.length} Records
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredTasks.length ? (
            <div className="p-10">
              <EmptyState
                title={searchTerm || statusFilter !== "all" ? "No matching tasks found" : "No tasks registered"}
                description={
                  searchTerm || statusFilter !== "all"
                    ? "Try clearing your search query or status filter."
                    : "Click 'Create Task' above to start your first multi-agent workflow."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/60 text-xs">
                    <TableHead className="py-3.5 px-4 font-bold text-slate-700 min-w-[280px]">Task</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[130px]">Task ID</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[120px]">Status</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[100px]">Reward</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[110px]">Created</TableHead>
                    <TableHead className="py-3.5 px-4 text-right font-bold text-slate-700 min-w-[110px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow
                      key={task.task_id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors text-xs"
                      onClick={() => setSelectedTask(task)}
                    >
                      <TableCell className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {task.task}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <User size={11} className="text-slate-400" />
                            {task.worker_id || "worker-agent"}
                          </span>
                          {task.verification_score != null && (
                            <span className="font-semibold text-emerald-700">
                              Score: {task.verification_score}/100
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-3 font-mono text-slate-600">
                        <div className="flex items-center gap-1">
                          <span>{task.task_id?.slice(0, 12)}…</span>
                          <button
                            type="button"
                            onClick={(e) => copyTaskId(task.task_id, e)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
                            title="Copy full Task ID"
                          >
                            {copiedId === task.task_id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-3">
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell className="py-3.5 px-3 font-bold text-slate-900 text-sm">
                        {formatCurrency(task.reward)}
                      </TableCell>
                      <TableCell className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {task.created_at ? task.created_at.slice(0, 10) : "Today"}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                          >
                            Details
                          </button>
                          {task.generated_report && (
                            <Link
                              to={`/reports/${task.task_id}`}
                              state={{ task }}
                              className="rounded-md bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              title="View Deliverable Report"
                            >
                              <FileText size={12} />
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Task Inspection Drawer / Modal ── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Task Information</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Task Title */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prompt / Task Goal</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{selectedTask.task}</p>
              </div>

              {/* Status & Key Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Status</span>
                  <div className="mt-1"><StatusBadge status={selectedTask.status} /></div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Escrow Reward</span>
                  <p className="mt-1 font-bold text-slate-900 text-sm">{formatCurrency(selectedTask.reward)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Verifier Score</span>
                  <p className="mt-1 font-bold text-slate-900 text-sm">
                    {selectedTask.verification_score != null ? `${selectedTask.verification_score}/100` : "Pending"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Worker Node</span>
                  <p className="mt-1 font-semibold text-slate-800 truncate">{selectedTask.worker_id || "worker-agent"}</p>
                </div>
              </div>

              {/* Task ID & Reference */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Cryptographic Task ID</span>
                <div className="flex items-center justify-between font-mono text-xs text-slate-700 bg-white border border-slate-200 p-2 rounded">
                  <span className="truncate mr-2">{selectedTask.task_id}</span>
                  <button
                    onClick={() => copyTaskId(selectedTask.task_id)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-sans font-semibold shrink-0"
                  >
                    {copiedId === selectedTask.task_id ? "Copied ✓" : "Copy ID"}
                  </button>
                </div>
              </div>

              {/* Feedback reasoning */}
              {selectedTask.verification_feedback && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-1.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-blue-600" />
                    Verifier Audit Feedback
                  </p>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedTask.verification_feedback}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
              {selectedTask.generated_report ? (
                <Link
                  to={`/reports/${selectedTask.task_id}`}
                  state={{ task: selectedTask }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  <FileText size={13} /> View Full Report
                </Link>
              ) : (
                <span className="text-xs text-slate-400">No report generated for this task</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="h-8 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;

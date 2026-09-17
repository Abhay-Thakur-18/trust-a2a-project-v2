import { useState } from "react";
import {
  Loader2,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  IndianRupee,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { createTask, executeTask, getTaskById } from "../../services/taskService";
import { getEscrowByTaskId } from "../../services/escrowService";
import WorkflowStepper from "./WorkflowStepper";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STATUS_LABELS = {
  created: "Client Agent Initiated",
  locked: "Funds Locked in Escrow",
  processing: "Worker Agent Processing",
  completed: "Worker Agent Completed",
  verified: "Verifier Agent Evaluated",
  paid: "Escrow Payment Settled",
  failed: "Workflow Failed",
  blocked: "Escrow Payment Blocked",
};

const SUGGESTED_TASKS = [
  "Generate AI Healthcare Market Report",
  "Analyze Power BI Industry Trends",
  "Write Technical Documentation for REST API",
  "Research Competitive Landscape for SaaS Tools",
];

function CreateTaskForm({ onSuccess, compact = false }) {
  const [task, setTask] = useState("");
  const [reward, setReward] = useState("500");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState("created");
  const [escrowStatus, setEscrowStatus] = useState(null);

  const pollTaskStatus = async (taskId) => {
    for (let i = 0; i < 60; i += 1) {
      const [taskData, escrowData] = await Promise.allSettled([
        getTaskById(taskId),
        getEscrowByTaskId(taskId),
      ]);
      if (taskData.status === "fulfilled" && taskData.value?.status) {
        setWorkflowStatus(taskData.value.status);
      }
      if (escrowData.status === "fulfilled" && escrowData.value?.status) {
        setEscrowStatus(escrowData.value.status);
      }
      if (taskData.value?.status === "paid" || escrowData.value?.status === "completed") {
        return taskData.value;
      }
      await sleep(2000);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setWorkflowStatus("created");
    setEscrowStatus(null);

    try {
      const lockResponse = await createTask({ task: task.trim(), reward: Number(reward) });
      if (!lockResponse?.success) throw new Error(lockResponse?.error || "Failed to lock funds in escrow");

      const taskId = lockResponse.task_id;
      setWorkflowStatus("locked");
      setEscrowStatus("locked");
      onSuccess?.(lockResponse);

      setWorkflowStatus("processing");
      const pollPromise = pollTaskStatus(taskId);
      const executeResponse = await executeTask(taskId);

      if (!executeResponse?.success) {
        setWorkflowStatus("failed");
        throw new Error(executeResponse?.error || "Workflow execution failed");
      }

      await pollPromise;

      const finalResult = { ...executeResponse, task_id: taskId };
      setWorkflowStatus(executeResponse?.payment?.status === "payment_released" ? "paid" : "verified");
      setEscrowStatus(executeResponse?.payment?.status === "payment_released" ? "completed" : escrowStatus);
      setResult(finalResult);
      onSuccess?.(finalResult);
      setTask("");
    } catch (err) {
      setWorkflowStatus("failed");
      setError(err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText size={13} className="text-blue-600" />
            Task Description
          </label>
          <span className="text-[11px] text-slate-400">{task.length}/200</span>
        </div>
        <textarea
          placeholder="e.g. Generate AI Healthcare Market Report with competitive analysis..."
          value={task}
          onChange={(e) => setTask(e.target.value.slice(0, 200))}
          required
          disabled={loading}
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 transition-colors resize-none"
        />

        {/* Suggested tasks pills */}
        {!loading && !result && task.length === 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTED_TASKS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTask(s)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reward amount */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <IndianRupee size={13} className="text-blue-600" />
          Escrow Reward Amount (INR)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 select-none">
            ₹
          </span>
          <input
            type="number"
            min="1"
            max="100000"
            placeholder="500"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 transition-colors"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !task.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Executing Multi-Agent Pipeline…
          </>
        ) : (
          <>
            <Sparkles size={15} />
            Dispatch Task to Worker Agent
            <ChevronRight size={14} className="ml-0.5" />
          </>
        )}
      </button>

      {/* Pipeline Progress */}
      {(loading || result) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pipeline Execution State
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
                workflowStatus === "failed"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : workflowStatus === "paid"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {STATUS_LABELS[workflowStatus] || workflowStatus}
            </span>
          </div>
          <WorkflowStepper status={workflowStatus} active={loading} />
          {loading && (
            <p className="text-xs text-slate-500 animate-pulse">
              Client Agent &rarr; Escrow Lock &rarr; Worker LLM Generation &rarr; Verifier Scoring &rarr; Payment Settlement
            </p>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
          <p>{typeof error === "string" ? error : JSON.stringify(error)}</p>
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Task Execution & Settlement Succeeded
            </div>
            {result.task_id && (
              <span className="font-mono text-xs text-slate-500">
                {result.task_id.slice(0, 16)}…
              </span>
            )}
          </div>

          {result.verification && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md border border-slate-200 bg-white p-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Verified</span>
                <span className="font-semibold text-slate-800">{result.verification.verified ? "Passed" : "Failed"}</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quality Score</span>
                <span className="font-semibold text-slate-800">{result.verification.score ?? "—"}/100</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Escrow Status</span>
                <span className="font-semibold text-emerald-600">
                  {result.payment?.status === "payment_released" ? "Released" : result.payment?.status || "Settled"}
                </span>
              </div>
            </div>
          )}

          {result.verification?.feedback && (
            <div className="rounded-md border border-slate-200 bg-white p-3 text-xs">
              <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <ClipboardCheck size={12} className="text-blue-600" />
                Verifier Quality Feedback
              </p>
              <p className="text-slate-600 leading-relaxed">{result.verification.feedback}</p>
            </div>
          )}
        </div>
      )}
    </form>
  );

  if (compact) return formContent;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <PlusCircle size={16} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Create New Agent Task</h2>
            <p className="text-xs text-slate-500">Autonomous A2A pipeline with cryptographic trust & automated escrow</p>
          </div>
        </div>
        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          A2A Protocol
        </span>
      </div>
      {formContent}
    </div>
  );
}

export default CreateTaskForm;

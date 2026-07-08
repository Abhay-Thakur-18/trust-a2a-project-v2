import { useState } from "react";
import {
  Loader2, PlusCircle, Sparkles, CheckCircle2, AlertCircle,
  Zap, ChevronRight, IndianRupee, FileText, ClipboardCheck, CreditCard,
} from "lucide-react";
import { createTask, executeTask, getTaskById } from "../../services/taskService";
import { getEscrowByTaskId } from "../../services/escrowService";
import WorkflowStepper from "./WorkflowStepper";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STATUS_LABELS = {
  created: "Client Agent started",
  locked: "Escrow locked funds",
  processing: "Worker Agent processing",
  completed: "Worker Agent completed",
  verified: "Verifier Agent verified",
  paid: "Escrow payment released",
  failed: "Workflow failed",
  blocked: "Escrow payment blocked",
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
  const [taskFocused, setTaskFocused] = useState(false);
  const [rewardFocused, setRewardFocused] = useState(false);

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

  const inputBase = {
    background: "var(--input)",
    border: "1.5px solid var(--input-border)",
    borderRadius: 14,
    color: "var(--foreground)",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    padding: "12px 16px",
    width: "100%",
    outline: "none",
    transition: "all 0.2s ease",
  };

  const inputFocused = {
    borderColor: "var(--primary)",
    background: "var(--card)",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.12)",
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Task description field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          <FileText size={14} style={{ color: "var(--primary)" }} />
          Task Description
          <span className="ml-auto text-[11px] font-normal" style={{ color: "var(--muted-foreground)" }}>
            {task.length}/200
          </span>
        </label>
        <div className="relative">
          <textarea
            placeholder="e.g. Generate AI Healthcare Market Report with competitive analysis..."
            value={task}
            onChange={(e) => setTask(e.target.value.slice(0, 200))}
            onFocus={() => setTaskFocused(true)}
            onBlur={() => setTaskFocused(false)}
            required
            disabled={loading}
            rows={3}
            style={{
              ...inputBase,
              resize: "none",
              ...(taskFocused ? inputFocused : {}),
            }}
          />
          {task.length === 0 && !taskFocused && (
            <span
              className="pointer-events-none absolute right-3 bottom-3 text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
            >
              Required
            </span>
          )}
        </div>

        {/* Suggested quick-fill tasks */}
        {!loading && !result && task.length === 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTED_TASKS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTask(s)}
                className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  background: "var(--muted)",
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--muted-foreground)";
                }}
              >
                {s.length > 40 ? s.slice(0, 38) + "…" : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reward field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          <IndianRupee size={14} style={{ color: "var(--primary)" }} />
          Reward Amount (INR)
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold select-none"
            style={{ color: rewardFocused ? "var(--primary)" : "var(--muted-foreground)", transition: "color 0.2s" }}
          >
            ₹
          </span>
          <input
            type="number"
            min="1"
            max="100000"
            placeholder="500"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            onFocus={() => setRewardFocused(true)}
            onBlur={() => setRewardFocused(false)}
            required
            disabled={loading}
            style={{
              ...inputBase,
              paddingLeft: 32,
              ...(rewardFocused ? inputFocused : {}),
            }}
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !task.trim()}
        className="relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? "linear-gradient(135deg, #4B72C4, #3B5FA0)"
            : "linear-gradient(135deg, var(--primary), #3B82F6)",
          boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.35)",
        }}
        onMouseEnter={(e) => {
          if (!loading && task.trim()) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.45)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.35)";
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Running A2A Pipeline…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Launch Task
            <ChevronRight size={14} />
          </span>
        )}
      </button>

      {/* Workflow status panel */}
      {(loading || result) && (
        <div
          className="animate-fade-in rounded-2xl border p-4 space-y-3"
          style={{
            background: "var(--muted)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
            <Zap size={13} style={{ color: "var(--primary)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
              Pipeline Progress
            </p>
            <div
              className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                background: workflowStatus === "failed" ? "var(--badge-danger-bg)" : workflowStatus === "paid" ? "var(--badge-success-bg)" : "var(--badge-primary-bg)",
                color: workflowStatus === "failed" ? "var(--badge-danger-text)" : workflowStatus === "paid" ? "var(--badge-success-text)" : "var(--badge-primary-text)",
                border: `1px solid ${workflowStatus === "failed" ? "var(--badge-danger-border)" : workflowStatus === "paid" ? "var(--badge-success-border)" : "var(--badge-primary-border)"}`,
              }}
            >
              {STATUS_LABELS[workflowStatus] || workflowStatus}
            </div>
          </div>
          <WorkflowStepper status={workflowStatus} active={loading} />
          {loading && (
            <p className="text-xs leading-relaxed animate-pulse" style={{ color: "var(--muted-foreground)" }}>
              Client Agent → Worker Agent → Verifier Agent → Escrow Service settling payment…
            </p>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="animate-fade-in flex items-start gap-3 rounded-2xl border p-4"
          style={{ background: "var(--badge-danger-bg)", borderColor: "var(--badge-danger-border)" }}
        >
          <AlertCircle size={16} style={{ color: "var(--badge-danger-text)", marginTop: 1, flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "var(--badge-danger-text)" }}>
            {typeof error === "string" ? error : JSON.stringify(error)}
          </p>
        </div>
      )}

      {/* Success result */}
      {result && (
        <div
          className="animate-fade-in-up space-y-3 rounded-2xl border p-4"
          style={{ background: "var(--badge-success-bg)", borderColor: "var(--badge-success-border)" }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: "var(--badge-success-text)" }} />
            <p className="text-sm font-bold" style={{ color: "var(--badge-success-text)" }}>
              Task Completed Successfully
            </p>
            {result.task_id && (
              <code className="ml-auto text-[11px] rounded-lg px-2 py-0.5" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                {result.task_id.slice(0, 16)}…
              </code>
            )}
          </div>

          {result.verification && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Verified", value: result.verification.verified ? "✓ Yes" : "✗ No" },
                { label: "Score", value: `${result.verification.score ?? "—"} / 100` },
                { label: "Payment", value: result.payment?.status === "payment_released" ? "Released" : result.payment?.status || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border p-2.5 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                  <p className="mt-1 text-sm font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {result.verification?.feedback && (
            <div className="rounded-xl border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-[11px] uppercase tracking-wide mb-1.5 font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <ClipboardCheck size={11} className="inline mr-1" />
                Verifier Feedback
              </p>
              <p className="text-xs leading-6" style={{ color: "var(--foreground)" }}>{result.verification.feedback}</p>
            </div>
          )}

          {result.worker?.result && (
            <div className="rounded-xl border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-[11px] uppercase tracking-wide mb-1.5 font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <FileText size={11} className="inline mr-1" />
                Worker Report Preview
              </p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-5" style={{ color: "var(--foreground)", opacity: 0.85 }}>
                {result.worker.result.slice(0, 1200)}
                {result.worker.result.length > 1200 ? "\n\n… (view full on Reports page)" : ""}
              </pre>
            </div>
          )}
        </div>
      )}
    </form>
  );

  if (compact) return form;

  return (
    <div
      className="rounded-3xl border animate-fade-in-up"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* Card header with gradient accent */}
      <div
        className="rounded-t-3xl px-6 pt-6 pb-5"
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(6,182,212,0.04) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, var(--primary), #3B82F6)", boxShadow: "0 4px 12px rgba(37,99,235,0.30)" }}
              >
                <PlusCircle size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Create New Task</h2>
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              AI pipeline: Client Agent → Worker Agent → Verifier Agent → Escrow
            </p>
          </div>
          <div
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(37,99,235,0.1)", color: "var(--primary)", border: "1px solid rgba(37,99,235,0.2)" }}
          >
            A2A
          </div>
        </div>
      </div>

      <div className="p-6">
        {form}
      </div>
    </div>
  );
}

export default CreateTaskForm;

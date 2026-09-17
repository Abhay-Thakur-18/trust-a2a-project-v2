import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

export function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 w-1/4 rounded-md bg-slate-200/70" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-12 w-full rounded-lg bg-slate-100/80 border border-slate-200/50" />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "No data available",
  description = "New records will be logged automatically once agents execute tasks.",
  action,
}) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
        <Inbox size={20} />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Unable to load data from microservices",
  description = "Please ensure backend services and database are reachable.",
  onRetry,
}) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-6 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2.5">
        <AlertCircle size={18} />
      </div>
      <p className="text-sm font-semibold text-red-900">{title}</p>
      <p className="mt-1 text-xs text-red-600 max-w-md">{description}</p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-3.5 h-8 gap-1.5 rounded-lg border-red-200 bg-white text-xs text-red-700 hover:bg-red-50"
        >
          <RefreshCw size={12} />
          Retry Request
        </Button>
      ) : null}
    </div>
  );
}

import { AlertTriangle, Inbox } from "lucide-react";

export function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-10 animate-pulse rounded-lg bg-muted/60" />
      ))}
    </div>
  );
}

export function EmptyState({ title = "No records found", description = "Data will appear when available." }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/40 p-6 text-center">
      <Inbox className="mb-2 text-muted-foreground" size={18} />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({ title = "Unable to load data", onRetry }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="mb-2 text-destructive" size={18} />
      <p className="text-sm font-medium">{title}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

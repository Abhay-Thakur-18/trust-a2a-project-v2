import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getVerifications } from "../../services/verificationService";
import FeedbackPanel from "../../components/shared/FeedbackPanel";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import { Button } from "../../components/ui/button";
import VerificationTrendChart from "../../components/charts/VerificationTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

function Verifications() {
  const { data, loading, error, refetch } = useApiQuery(getVerifications);

  // ✅ All hooks MUST be called unconditionally before any early return
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const avgScore = useMemo(() => {
    const scored = rows.filter((r) => r.score != null);
    if (!scored.length) return null;
    return Math.round(scored.reduce((s, r) => s + Number(r.score || 0), 0) / scored.length);
  }, [rows]);

  const passCount = useMemo(() => rows.filter((r) => r.verified).length, [rows]);
  const failCount = rows.length - passCount;

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Verifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Detailed verifier decisions, scores, and release recommendations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Summary Stat Cards */}
      {rows.length > 0 && (
        <div className="stagger-children grid gap-4 sm:grid-cols-3">
          <Card className="transition-all hover:-translate-y-1 hover:shadow-md">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-muted-foreground">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{rows.length}</p>
              <Badge variant="outline" className="mt-2 text-[11px]">All verifications</Badge>
            </CardContent>
          </Card>
          <Card className="transition-all hover:-translate-y-1 hover:shadow-md border-emerald-500/30">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-muted-foreground">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-emerald-500">{passCount}</p>
              <Badge variant="outline" className="mt-2 text-[11px] border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                {rows.length ? Math.round((passCount / rows.length) * 100) : 0}% pass rate
              </Badge>
            </CardContent>
          </Card>
          <Card className="transition-all hover:-translate-y-1 hover:shadow-md border-amber-500/30">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-muted-foreground">Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-amber-500">
                {avgScore != null ? `${avgScore}%` : "—"}
              </p>
              <Badge variant="outline" className="mt-2 text-[11px] border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300">
                {failCount} rejected
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Chart */}
      {rows.length > 0 && (
        <VerificationTrendChart verifications={rows} />
      )}

      {/* Feedback Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Verifier Feedback</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Detailed AI verifier decisions per task</p>
          </div>
          {rows.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {rows.length} review{rows.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {!rows.length ? (
          <EmptyState
            title="No verifications yet"
            description="Create a task to trigger the verification pipeline. Results will appear here."
          />
        ) : (
          <div className="stagger-children grid gap-4 xl:grid-cols-2">
            {rows.map((row) => (
              <FeedbackPanel key={row.id || row.task_id} verification={row} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Verifications;

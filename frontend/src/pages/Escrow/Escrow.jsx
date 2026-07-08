import { RefreshCw, Activity } from "lucide-react";
import { useMemo } from "react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getEscrow, getEscrowAgentCard, getTransactions } from "../../services/escrowService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import MetricCard from "../../components/shared/MetricCard";
import StatusBadge from "../../components/shared/StatusBadge";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import { formatCurrency, toArray } from "../../lib/formatters";
import { Lock, Unlock, Wallet, Ban } from "lucide-react";
import EscrowThroughputChart from "../../components/charts/EscrowThroughputChart";
import EscrowStatusChart from "../../components/charts/EscrowStatusChart";
import { Badge } from "../../components/ui/badge";

function Escrow() {
  const { data, loading, error, refetch } = useApiQuery(async () => {
    const [escrowResult, transactionsResult, cardResult] = await Promise.allSettled([
      getEscrow(),
      getTransactions(),
      getEscrowAgentCard(),
    ]);

    return {
      escrow: escrowResult.status === "fulfilled" ? escrowResult.value : null,
      transactions: transactionsResult.status === "fulfilled" ? toArray(transactionsResult.value) : [],
      card: cardResult.status === "fulfilled" ? cardResult.value : null,
      errors: [escrowResult, transactionsResult, cardResult]
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason?.message || "Request failed"),
    };
  });

  const transactions = useMemo(() => data?.transactions || [], [data]);
  const lockedCount = useMemo(() => transactions.filter((t) => t.status === "locked").length, [transactions]);
  const completedCount = useMemo(() => transactions.filter((t) => t.status === "completed").length, [transactions]);
  const blockedCount = useMemo(() => transactions.filter((t) => t.status === "blocked").length, [transactions]);

  if (loading && !data) return <LoadingSkeleton rows={8} />;
  if (error && !data) return <ErrorState onRetry={() => refetch()} />;

  const escrow = data?.escrow || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Escrow</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live fund locking, release, and ledger from escrow service.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {data?.errors?.length ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
          Some escrow data failed to load. Showing available results.
        </div>
      ) : null}

      {/* Metric Cards */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Locked Balance"
          value={formatCurrency(escrow.locked_balance ?? escrow.balance ?? 0)}
          icon={Lock}
          delta={`${lockedCount} active lock${lockedCount !== 1 ? "s" : ""}`}
          tone="warning"
        />
        <MetricCard
          title="Released Total"
          value={formatCurrency(escrow.released_total ?? 0)}
          icon={Unlock}
          delta={`${completedCount} completed`}
          tone="success"
        />
        <MetricCard
          title="Blocked Funds"
          value={formatCurrency(escrow.blocked_total ?? 0)}
          icon={Ban}
          delta={blockedCount ? `${blockedCount} blocked` : "None blocked"}
          tone="warning"
        />
        <MetricCard
          title="Total Transactions"
          value={escrow.total_transactions ?? transactions.length}
          icon={Wallet}
          delta="All escrow events"
        />
      </div>

      {/* Charts */}
      {transactions.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          <EscrowThroughputChart transactions={transactions} className="xl:col-span-2" />
          <EscrowStatusChart transactions={transactions} />
        </div>
      )}

      {/* Escrow Ledger Table */}
      <Card className="glass-panel overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                Escrow Ledger
              </CardTitle>
              <CardDescription className="mt-1">
                {transactions.length
                  ? `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} — showing full escrow history`
                  : "No transactions recorded yet"}
              </CardDescription>
            </div>
            {transactions.length > 0 && (
              <Badge variant="outline" className="font-mono text-xs">
                {transactions.length} records
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!transactions.length ? (
            <div className="p-8">
              <EmptyState
                title="No escrow transactions"
                description="Create a task to lock funds in escrow. Transactions will appear here once the pipeline starts."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="pl-5 font-semibold text-[11px] uppercase tracking-wide">#</TableHead>
                    <TableHead className="font-semibold text-[11px] uppercase tracking-wide">Task ID</TableHead>
                    <TableHead className="font-semibold text-[11px] uppercase tracking-wide">Payer</TableHead>
                    <TableHead className="font-semibold text-[11px] uppercase tracking-wide">Payee</TableHead>
                    <TableHead className="font-semibold text-[11px] uppercase tracking-wide">Status</TableHead>
                    <TableHead className="font-semibold text-[11px] uppercase tracking-wide">Date</TableHead>
                    <TableHead className="text-right pr-5 font-semibold text-[11px] uppercase tracking-wide">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, idx) => (
                    <TableRow
                      key={tx.id}
                      className="group transition-all duration-150 hover:bg-primary/5 cursor-default"
                      style={{ borderLeft: "3px solid transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = "var(--primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = "transparent"; }}
                    >
                      <TableCell className="pl-5 text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                      <TableCell className="max-w-[160px] truncate font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors" title={tx.task_id}>
                        {tx.task_id || <span className="italic text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.payer || <span className="text-muted-foreground italic text-xs">Not assigned</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.payee || <span className="text-muted-foreground italic text-xs">Not assigned</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tx.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.created_at?.slice(0, 10) || <span className="italic text-xs">—</span>}
                      </TableCell>
                      <TableCell className="text-right pr-5 font-semibold text-sm group-hover:text-primary transition-colors">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escrow Agent Card */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-base">Escrow Agent Configuration</CardTitle>
          <CardDescription>Raw agent card metadata from the escrow service.</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(data?.card || {}).length === 0 ? (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center">
              <p className="text-sm text-muted-foreground italic">No agent card data available — ensure the escrow service is running.</p>
            </div>
          ) : (
            <pre className="overflow-x-auto rounded-xl border border-border/40 bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
              {JSON.stringify(data?.card || {}, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Escrow;

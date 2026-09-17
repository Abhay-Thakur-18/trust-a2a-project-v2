import { RefreshCw, Lock, Unlock, Wallet, Ban, ArrowRight, ShieldCheck, Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getEscrow, getEscrowAgentCard, getTransactions } from "../../services/escrowService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import MetricCard from "../../components/shared/MetricCard";
import StatusBadge from "../../components/shared/StatusBadge";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";
import { formatCurrency, toArray } from "../../lib/formatters";
import { Link } from "react-router-dom";

function Escrow() {
  const [copiedId, setCopiedId] = useState(null);
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
  const completedCount = useMemo(() => transactions.filter((t) => ["completed", "paid"].includes(t.status)).length, [transactions]);
  const totalLockedAmount = useMemo(() => {
    return transactions.filter((t) => t.status === "locked").reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [transactions]);
  const totalReleasedAmount = useMemo(() => {
    return transactions.filter((t) => ["completed", "paid"].includes(t.status)).reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [transactions]);

  const copyId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading && !data) return <LoadingSkeleton rows={8} />;
  if (error && !data) return <ErrorState onRetry={() => refetch()} />;

  const escrow = data?.escrow || {};
  const displayLocked = escrow.locked_balance ?? totalLockedAmount;
  const displayReleased = escrow.released_total ?? totalReleasedAmount;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Escrow</h1>
          <p className="text-sm text-slate-500 mt-1">
            Financial operations dashboard for fund locks, verifier authorizations, and settlement payouts.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3.5 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw size={14} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Vault
          </Button>
        </div>
      </div>

      {data?.errors?.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
          <span>Some escrow nodes returned partial telemetry. Available records are rendered below.</span>
        </div>
      ) : null}

      {/* ── Top Metrics: 4 KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Locked"
          value={formatCurrency(displayLocked)}
          icon={Lock}
          delta={`${lockedCount} active locks`}
          tone="warning"
        />
        <MetricCard
          title="Total Released"
          value={formatCurrency(displayReleased)}
          icon={Unlock}
          delta={`${completedCount} settlements completed`}
          tone="success"
        />
        <MetricCard
          title="Active Locks"
          value={lockedCount}
          icon={ShieldCheck}
          delta={lockedCount > 0 ? "Awaiting verifier evaluation" : "No funds currently locked"}
          tone={lockedCount > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Transactions"
          value={escrow.total_transactions ?? transactions.length}
          icon={Wallet}
          delta="Total immutable ledger entries"
          tone="default"
        />
      </div>

      {/* ── Escrow Records Table ── */}
      <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Escrow Records</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Complete register of all locked and released fund allocations
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
            {transactions.length} Records
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {!transactions.length ? (
            <div className="p-10">
              <EmptyState
                title="No escrow records found"
                description="Create a task to lock funds into escrow. Financial logs will populate as agents execute."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/60 text-xs">
                    <TableHead className="py-3.5 px-4 font-bold text-slate-700 min-w-[260px]">Task</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[120px]">Amount</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[110px]">Status</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[110px]">Created</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[110px]">Released</TableHead>
                    <TableHead className="py-3.5 px-4 text-right font-bold text-slate-700 min-w-[140px]">Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, idx) => {
                    const isReleased = ["completed", "paid"].includes(String(tx.status).toLowerCase());
                    const txnId = tx.id ? `TXN-${tx.id}` : `TXN-${idx + 1}`;

                    return (
                      <TableRow
                        key={tx.id || idx}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-xs"
                      >
                        <TableCell className="py-3.5 px-4 max-w-[260px]">
                          <p className="font-semibold text-slate-900 leading-snug">
                            {tx.task || tx.task_id || "Autonomous Task Execution"}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400 mt-0.5">{tx.task_id || "—"}</p>
                        </TableCell>
                        <TableCell className="py-3.5 px-3 font-bold text-slate-900 text-sm">
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="py-3.5 px-3">
                          <StatusBadge status={tx.status} />
                        </TableCell>
                        <TableCell className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {tx.created_at ? tx.created_at.slice(0, 10) : "Recent"}
                        </TableCell>
                        <TableCell className="py-3.5 px-3 whitespace-nowrap">
                          {isReleased ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Settled ✓
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                              Locked in Vault
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-right font-mono text-slate-600">
                          <div className="flex items-center justify-end gap-1">
                            <span>{txnId}</span>
                            <button
                              type="button"
                              onClick={(e) => copyId(txnId, e)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded"
                              title="Copy Transaction ID"
                            >
                              {copiedId === txnId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Escrow Microservice Agent Schema Card ── */}
      <Card className="border border-slate-200 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-sm font-bold text-slate-900">Escrow Service Agent Protocol</CardTitle>
          <CardDescription className="text-xs text-slate-500">Autonomous payment microservice contract on Port 8003</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {Object.keys(data?.card || {}).length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">No agent card schema available from escrow microservice port 8003.</p>
            </div>
          ) : (
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-800 font-mono leading-relaxed">
              {JSON.stringify(data?.card || {}, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Escrow;

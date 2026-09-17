import { RefreshCw, Search, X, Copy, Check, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getTransactions } from "../../services/escrowService";
import { toArray, formatCurrency } from "../../lib/formatters";
import StatusBadge from "../../components/shared/StatusBadge";
import MetricCard from "../../components/shared/MetricCard";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";

function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const { data, loading, error, refetch } = useApiQuery(getTransactions);
  const rawRows = useMemo(() => toArray(data), [data]);

  const copyId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredRows = useMemo(() => {
    return rawRows.filter((tx) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        String(tx.id || "").toLowerCase().includes(term) ||
        String(tx.task_id || "").toLowerCase().includes(term) ||
        String(tx.task || "").toLowerCase().includes(term) ||
        String(tx.status || "").toLowerCase().includes(term)
      );
    });
  }, [rawRows, searchTerm]);

  const totalVolume = useMemo(() => {
    return rawRows.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [rawRows]);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable settlement ledger and payout execution records.
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
            Refresh Ledger
          </Button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Transaction ID or Task Reference..."
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

        <div className="text-xs font-medium text-slate-500">
          Total Ledger Volume: <span className="font-bold text-slate-900 ml-1">{formatCurrency(totalVolume)}</span>
        </div>
      </div>

      {/* ── Ledger Card & Large Table ── */}
      <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Settlement Ledger</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Showing {filteredRows.length} of {rawRows.length} total ledger entries
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
            {filteredRows.length} Entries
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredRows.length ? (
            <div className="p-10">
              <EmptyState
                title={searchTerm ? "No transactions matching search" : "No transactions found"}
                description={
                  searchTerm
                    ? "Try clearing your search query."
                    : "Create a task to initiate escrow transactions and ledger events."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/60 text-xs">
                    <TableHead className="py-3.5 px-4 font-bold text-slate-700 min-w-[140px]">Transaction ID</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[240px]">Task</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[110px]">Amount</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[120px]">Type</TableHead>
                    <TableHead className="py-3.5 px-3 font-bold text-slate-700 min-w-[120px]">Status</TableHead>
                    <TableHead className="py-3.5 px-4 text-right font-bold text-slate-700 min-w-[120px]">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((txn, idx) => {
                    const txnId = txn?.id ? `TXN-${txn.id}` : `TXN-${idx + 1}`;
                    const isPayout = ["completed", "paid"].includes(String(txn?.status).toLowerCase());

                    return (
                      <TableRow
                        key={txn?.id || idx}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-xs"
                      >
                        <TableCell className="py-3.5 px-4 font-mono text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>{txnId}</span>
                            <button
                              type="button"
                              onClick={(e) => copyId(txnId, e)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                              title="Copy Transaction ID"
                            >
                              {copiedId === txnId ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-3 max-w-[240px]">
                          <p className="font-semibold text-slate-900 truncate" title={txn?.task || txn?.task_id}>
                            {txn?.task || txn?.task_id || "Autonomous Task Execution"}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400 mt-0.5">{txn?.task_id || "—"}</p>
                        </TableCell>
                        <TableCell className="py-3.5 px-3 font-bold text-slate-900 text-sm">
                          {formatCurrency(txn?.amount || 0)}
                        </TableCell>
                        <TableCell className="py-3.5 px-3 font-medium text-slate-600">
                          {isPayout ? "Escrow Release" : "Escrow Lock"}
                        </TableCell>
                        <TableCell className="py-3.5 px-3">
                          <StatusBadge status={txn?.status} />
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                          {txn?.created_at ? txn.created_at.slice(0, 10) : "Recent"}
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
    </div>
  );
}

export default Transactions;

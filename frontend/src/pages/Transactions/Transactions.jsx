import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getTransactions } from "../../services/escrowService";
import { toArray, formatCurrency } from "../../lib/formatters";
import StatusBadge from "../../components/shared/StatusBadge";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/shared/DataState";

function Transactions() {
  const { data, loading, error, refetch } = useApiQuery(getTransactions);
  const rows = toArray(data);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Live escrow ledger from the backend.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {!rows.length ? (
            <EmptyState title="No transactions found" description="Create a task to generate escrow transactions." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((txn, idx) => (
                  <TableRow key={txn?.id || idx}>
                    <TableCell>{txn?.id || `tx-${idx + 1}`}</TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs">{txn?.task_id || "-"}</TableCell>
                    <TableCell><StatusBadge status={txn?.status} /></TableCell>
                    <TableCell>{txn?.created_at?.slice(0, 10) || "-"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(txn?.amount || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Transactions;

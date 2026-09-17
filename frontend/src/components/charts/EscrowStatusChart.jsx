import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../shared/DataState";
import ChartTooltip from "./ChartTooltip";
import { aggregateEscrowStatus } from "../../lib/chartUtils";

function EscrowStatusChart({ transactions = [], className = "" }) {
  const data = aggregateEscrowStatus(transactions);

  return (
    <Card className={`border border-slate-200/80 bg-white shadow-xs ${className}`}>
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-sm font-semibold text-slate-900">Escrow Status Mix</CardTitle>
        <CardDescription className="text-xs text-slate-500">Locked, released, and blocked fund distribution</CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-4">
        {!data.length ? (
          <EmptyState title="No escrow events yet" description="Escrow statuses appear after task creation." />
        ) : (
          <div className="grid h-full items-center gap-4 md:grid-cols-[1fr_1fr]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={4}
                  animationDuration={800}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} Transactions`} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-1.5">
              {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-50/50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{item.value}</span>
                    <span className="ml-1.5 text-[10px] text-slate-400">({item.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EscrowStatusChart;

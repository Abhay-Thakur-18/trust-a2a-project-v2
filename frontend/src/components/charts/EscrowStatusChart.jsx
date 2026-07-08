import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../shared/DataState";
import ChartTooltip from "./ChartTooltip";
import { aggregateEscrowStatus } from "../../lib/chartUtils";

function EscrowStatusChart({ transactions = [], className = "" }) {
  const data = aggregateEscrowStatus(transactions);

  return (
    <Card className={`transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>Escrow Status Mix</CardTitle>
        <CardDescription>Locked, released, and blocked fund distribution</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
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
                  outerRadius={78}
                  paddingAngle={4}
                  animationDuration={900}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} Transactions`} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.pct}%</span>
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

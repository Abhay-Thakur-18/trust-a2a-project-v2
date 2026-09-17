import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../shared/DataState";
import ChartTooltip from "./ChartTooltip";
import { aggregateTaskStatus } from "../../lib/chartUtils";

function TaskStatusDistribution({ tasks = [], className = "" }) {
  const data = aggregateTaskStatus(tasks);
  const total = tasks.length;

  return (
    <Card className={`border border-slate-200/80 bg-white shadow-xs ${className}`}>
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-sm font-semibold text-slate-900">Task Status Distribution</CardTitle>
        <CardDescription className="text-xs text-slate-500">Live breakdown of all tasks in the pipeline</CardDescription>
      </CardHeader>
      <CardContent className="h-80 pt-4">
        {!data.length ? (
          <EmptyState title="No task data yet" description="Create a task to populate this chart." />
        ) : (
          <div className="grid h-full gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={3}
                    animationDuration={800}
                    animationBegin={100}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} tasks`} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold tracking-tight text-slate-900 leading-none">{total}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">Total Tasks</p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1.5 overflow-y-auto max-h-[260px] pr-1">
              {data.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-50/50 px-3 py-1.5 text-xs transition-colors hover:bg-slate-100/70"
                >
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

export default TaskStatusDistribution;

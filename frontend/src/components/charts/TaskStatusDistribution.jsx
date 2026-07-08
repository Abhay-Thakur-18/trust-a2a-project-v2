import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../shared/DataState";
import ChartTooltip from "./ChartTooltip";
import { aggregateTaskStatus } from "../../lib/chartUtils";

function TaskStatusDistribution({ tasks = [], className = "" }) {
  const data = aggregateTaskStatus(tasks);
  const total = tasks.length;

  return (
    <Card className={`transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>Task Status Distribution</CardTitle>
        <CardDescription>Live breakdown of all tasks in the pipeline</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
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
                    outerRadius={92}
                    paddingAngle={3}
                    animationDuration={900}
                    animationBegin={120}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} tasks`} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-semibold tracking-tight">{total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2">
              {data.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.value}</p>
                    <p className="text-[11px] text-muted-foreground">{item.pct}%</p>
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

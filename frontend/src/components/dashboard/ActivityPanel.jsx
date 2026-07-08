import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Wallet, ShieldCheck, Clock3 } from "lucide-react";

const activities = [
  {
    icon: CheckCircle2,
    title: "Task TASK-001 completed",
    time: "2 min ago",
    color: "text-green-400",
  },
  {
    icon: ShieldCheck,
    title: "Verification successful",
    time: "8 min ago",
    color: "text-blue-400",
  },
  {
    icon: Wallet,
    title: "Escrow payment released",
    time: "15 min ago",
    color: "text-orange-400",
  },
  {
    icon: Clock3,
    title: "Worker accepted task",
    time: "21 min ago",
    color: "text-violet-400",
  },
];

function ActivityPanel() {
  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle className="text-white">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-blue-500/30"
            >
              <div className="rounded-xl bg-slate-900 p-3">
                <Icon className={item.color} size={20} />
              </div>

              <div className="flex-1">
                <p className="font-medium text-white">
                  {item.title}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default ActivityPanel;
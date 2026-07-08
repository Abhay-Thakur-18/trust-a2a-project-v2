import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const tasks = [
  {
    id: "TASK-001",
    worker: "worker-1",
    reward: "₹500",
    status: "Paid",
    score: "98%",
  },
  {
    id: "TASK-002",
    worker: "worker-2",
    reward: "₹750",
    status: "Verified",
    score: "95%",
  },
  {
    id: "TASK-003",
    worker: "worker-3",
    reward: "₹1200",
    status: "Running",
    score: "--",
  },
  {
    id: "TASK-004",
    worker: "worker-4",
    reward: "₹350",
    status: "Pending",
    score: "--",
  },
];

function statusVariant(status) {
  switch (status) {
    case "Paid":
      return "bg-green-500/15 text-green-400 border-green-500/30";

    case "Verified":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";

    case "Running":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

    default:
      return "bg-slate-700 text-slate-300 border-slate-600";
  }
}

function RecentTasks() {
  return (
    <Card className="border-slate-800 bg-slate-900">

      <CardHeader>
        <CardTitle className="text-white">
          Recent Tasks
        </CardTitle>
      </CardHeader>

      <CardContent>

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>Task ID</TableHead>

              <TableHead>Worker</TableHead>

              <TableHead>Reward</TableHead>

              <TableHead>Status</TableHead>

              <TableHead>Score</TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="hover:bg-slate-800 transition-colors"
              >
                <TableCell className="font-medium text-white">
                  {task.id}
                </TableCell>

                <TableCell>{task.worker}</TableCell>

                <TableCell>{task.reward}</TableCell>

                <TableCell>
                  <Badge className={statusVariant(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>

                <TableCell>{task.score}</TableCell>

              </TableRow>
            ))}

          </TableBody>

        </Table>

      </CardContent>

    </Card>
  );
}

export default RecentTasks;
import { Badge } from "../ui/badge";

const toneMap = {
  completed: "default",
  paid: "default",
  verified: "default",
  processing: "secondary",
  created: "secondary",
  locked: "outline",
  failed: "destructive",
  blocked: "destructive",
};

function StatusBadge({ status }) {
  const key = String(status || "unknown").toLowerCase();
  return <Badge variant={toneMap[key] || "outline"}>{status || "unknown"}</Badge>;
}

export default StatusBadge;

import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

function SystemStatus() {
  return (
    <Card>
  <CardHeader>
    <CardTitle>System Status</CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">

    <div className="flex justify-between">
      <span>Worker Agent</span>
      <Badge>Online</Badge>
    </div>

    <div className="flex justify-between">
      <span>Verifier Agent</span>
      <Badge>Online</Badge>
    </div>

    <div className="flex justify-between">
      <span>Escrow</span>
      <Badge variant="secondary">Running</Badge>
    </div>

    <div className="flex justify-between">
      <span>Database</span>
      <Badge>Connected</Badge>
    </div>

  </CardContent>
</Card>
  );
}

export default SystemStatus;
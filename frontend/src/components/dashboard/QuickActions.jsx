import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button className="w-full">Create Task</Button>
        <Button className="w-full">Verify Report</Button>
        <Button className="w-full">Release Escrow</Button>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
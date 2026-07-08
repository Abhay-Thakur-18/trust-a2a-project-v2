import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

function MetricCard({ icon: Icon, title, value, delta, tone = "default" }) {
  const toneClass = tone === "success" ? "text-emerald-300" : tone === "warning" ? "text-amber-300" : "text-sky-300";

  return (
    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        {Icon ? <Icon size={16} className={toneClass} /> : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {delta ? (
          <Badge variant="outline" className="mt-2 text-[11px]">
            {delta}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default MetricCard;

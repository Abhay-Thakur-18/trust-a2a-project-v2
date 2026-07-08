import { Card, CardContent } from "../ui/card";

function StatCard({ title, value, change, icon: Icon, color, bg }) {
  return (
    <Card className="border-slate-800 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10">
      <CardContent className="p-6">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm text-slate-400">
              {title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {value}
            </h2>

            <p className="mt-3 text-sm font-medium text-green-400">
              {change} this week
            </p>

          </div>

          <div className={`rounded-xl p-3 ${bg}`}>
            <Icon className={color} size={24} />
          </div>

        </div>

      </CardContent>
    </Card>
  );
}

export default StatCard;
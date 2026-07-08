import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const STEPS = [
  { key: "created", label: "Client Agent", description: "Creates task and starts pipeline" },
  { key: "processing", label: "Worker Agent", description: "Generates report" },
  { key: "verified", label: "Verifier Agent", description: "Checks quality and score" },
  { key: "paid", label: "Escrow Service", description: "Releases or blocks payment" },
];

const statusToStep = {
  created: 0,
  locked: 0,
  processing: 1,
  completed: 1,
  verified: 2,
  paid: 3,
  failed: 3,
  blocked: 3,
};

function WorkflowStepper({ status, active = false }) {
  const current = statusToStep[String(status || "created").toLowerCase()] ?? 0;

  return (
    <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {STEPS.map((step, index) => {
        const done = index < current;
        const currentStep = index === current;
        const pending = index > current;

        return (
          <li
            key={step.key}
            className={cn(
              "animate-fade-in-up flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all duration-300",
              done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              currentStep && "border-primary/40 bg-primary/10 text-foreground shadow-sm",
              pending && "border-border/60 bg-muted/20 text-muted-foreground",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {done ? (
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            ) : currentStep && active ? (
              <Loader2 size={14} className="shrink-0 animate-spin text-primary" />
            ) : (
              <Circle size={14} className="shrink-0 opacity-50" />
            )}
            <div className="min-w-0">
              <p className="font-medium">{step.label}</p>
              <p className="truncate text-[11px] opacity-70">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default WorkflowStepper;

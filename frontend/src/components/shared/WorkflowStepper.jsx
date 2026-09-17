import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const STEPS = [
  { key: "created", label: "Client Agent", description: "Creates task & initiates escrow" },
  { key: "processing", label: "Worker Agent", description: "Generates Gemini analysis" },
  { key: "verified", label: "Verifier Agent", description: "Scores output & validates quality" },
  { key: "paid", label: "Escrow Service", description: "Settles and releases funds" },
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
    <ol className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {STEPS.map((step, index) => {
        const done = index < current;
        const currentStep = index === current;
        const pending = index > current;

        return (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-colors",
              done && "border-emerald-200 bg-emerald-50 text-emerald-800",
              currentStep && "border-blue-200 bg-blue-50/80 text-blue-900 shadow-xs",
              pending && "border-slate-200 bg-slate-50/60 text-slate-500",
            )}
          >
            {done ? (
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            ) : currentStep && active ? (
              <Loader2 size={15} className="shrink-0 animate-spin text-blue-600" />
            ) : (
              <Circle size={15} className="shrink-0 text-slate-400" />
            )}
            <div className="min-w-0">
              <p className="font-semibold">{step.label}</p>
              <p className="truncate text-[11px] text-slate-500 mt-0.5">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default WorkflowStepper;

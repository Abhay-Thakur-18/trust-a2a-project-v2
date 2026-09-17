import { Button } from "../ui/button";

function PageHeader({ title, description, actionLabel, onAction, actionIcon: ActionIcon }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{title}</h1>
        {description ? <p className="mt-0.5 text-xs text-slate-500 max-w-3xl md:text-sm">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="shrink-0 h-8 gap-1.5 rounded-lg border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {ActionIcon ? <ActionIcon size={13} /> : null}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default PageHeader;

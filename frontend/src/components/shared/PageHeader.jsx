import { Button } from "../ui/button";

function PageHeader({ title, description, actionLabel, onAction, actionIcon: ActionIcon }) {
  return (
    <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground md:text-base">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" onClick={onAction} className="shrink-0">
          {ActionIcon ? <ActionIcon size={14} /> : null}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default PageHeader;

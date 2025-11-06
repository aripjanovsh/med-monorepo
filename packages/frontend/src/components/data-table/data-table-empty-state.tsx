import { FileQuestion } from "lucide-react";

interface DataTableEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export function DataTableEmptyState({
  title = "Нет данных",
  description = "Данные отсутствуют или не найдены",
  icon: Icon = FileQuestion,
  action,
}: DataTableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

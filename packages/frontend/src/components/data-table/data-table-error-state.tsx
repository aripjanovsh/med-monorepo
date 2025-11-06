import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTableErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | unknown;
  icon?: React.ComponentType<{ className?: string }>;
  onRetry?: () => void;
  retryText?: string;
}

export function DataTableErrorState({
  title = "Ошибка при загрузке данных",
  description,
  error,
  icon: Icon = AlertCircle,
  onRetry,
  retryText = "Повторить попытку",
}: DataTableErrorStateProps) {
  // Extract error message
  const errorMessage = description || (error instanceof Error ? error.message : undefined);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-3">
        <Icon className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-destructive">{title}</h3>
      {errorMessage && (
        <p className="mb-4 text-sm text-muted-foreground max-w-sm">{errorMessage}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryText}
        </Button>
      )}
    </div>
  );
}

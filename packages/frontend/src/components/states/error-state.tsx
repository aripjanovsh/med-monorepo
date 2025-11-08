import type { ReactElement } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
};

export const ErrorState = ({
  title = "Ошибка при загрузке",
  description = "Произошла ошибка при загрузке данных",
  onRetry,
  onBack,
  backLabel = "Назад",
}: ErrorStateProps): ReactElement => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              Повторить
            </Button>
          )}
          {onBack && (
            <Button onClick={onBack} variant="outline">
              {backLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

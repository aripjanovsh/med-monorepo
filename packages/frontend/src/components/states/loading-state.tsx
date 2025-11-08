import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  title?: string;
  description?: string;
};

export const LoadingState = ({
  title = "Загрузка...",
  description,
}: LoadingStateProps): ReactElement => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

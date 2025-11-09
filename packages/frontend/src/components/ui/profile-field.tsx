import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type ProfileFieldProps = {
  label: string;
  value?: string | number | null | ReactNode;
  icon?: LucideIcon;
  variant?: "vertical" | "horizontal";
};

export const ProfileField = ({
  label,
  value,
  icon: Icon,
  variant = "vertical",
}: ProfileFieldProps) => {
  const display =
    value === null || value === undefined || value === "" ? "-" : value;

  if (variant === "horizontal") {
    return (
      <div className="flex items-center space-x-2">
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm truncate">{display}</span>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {Icon && (
        <div className="flex items-center gap-1 mb-1">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
        </div>
      )}
      {!Icon && <p className="text-xs text-muted-foreground mb-1">{label}</p>}
      <p className="text-sm font-medium truncate">{display}</p>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ComponentProps, ElementType } from "react";

interface CardOverviewProps extends ComponentProps<"div"> {
  title?: string;
  icon?: ElementType;
}

export function CardOverview({
  className,
  children,
  title,
  ...props
}: CardOverviewProps) {
  return (
    <Card className={cn("gap-4", className)}>
      {(title || props.icon) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {props.icon && (
            <props.icon className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

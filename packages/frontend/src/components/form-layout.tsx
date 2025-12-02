import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: string;
  withCard?: boolean;
  children: ReactNode;
  className?: string;
};

export const FormSection: FC<FormSectionProps> = ({
  title,
  description,
  withCard = true,
  children,
  className,
}: FormSectionProps) => {
  const content = (
    <div className={cn("grid lg:grid-cols-10 gap-8", className)}>
      <div className="space-y-0.5 lg:col-span-3">
        <h3 className="leading-none  font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm lg:max-w-sm">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4 lg:col-span-7">{children}</div>
    </div>
  );

  return withCard ? (
    <Card className={className}>
      <CardContent className="grid lg:grid-cols-10 gap-8">
        {content}
      </CardContent>
    </Card>
  ) : (
    content
  );
};

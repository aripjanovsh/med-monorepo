import { Card, CardContent } from "@/components/ui/card";
import { FC, ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const FormSection: FC<FormSectionProps> = ({
  title,
  description,
  children,
}: FormSectionProps) => {
  return (
    <Card>
      <CardContent className="grid lg:grid-cols-10 gap-8">
        <div className="space-y-0.5 lg:col-span-3">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm lg:max-w-sm">
              {description}
            </p>
          )}
        </div>
        <div className="space-y-4 lg:col-span-7">{children}</div>
      </CardContent>
    </Card>
  );
};

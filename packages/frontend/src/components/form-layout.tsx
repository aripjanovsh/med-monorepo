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
      <CardContent className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-0.5">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm lg:max-w-sm">
              {description}
            </p>
          )}
        </div>
        <div className="space-y-4 col-span-2">{children}</div>
      </CardContent>
    </Card>
  );
};

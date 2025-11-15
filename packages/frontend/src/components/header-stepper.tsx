import { Check } from "lucide-react";

export interface HeaderStepperProps {
  steps: {
    key: string;
    title: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[];
  step: number;
}

export const HeaderStepper = ({ steps, step }: HeaderStepperProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((s, i) => {
        const state =
          i < step ? "complete" : i === step ? "active" : "upcoming";
        const { Icon } = s;
        return (
          <div key={s.key} className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                {state === "active" && (
                  <div className="absolute -inset-1 rounded-full border-2 border-dashed border-primary" />
                )}
                <div
                  className={
                    "size-6 rounded-full flex items-center justify-center " +
                    (state === "complete"
                      ? "bg-green-500 text-white"
                      : state === "active"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border-2 border-muted-foreground/30 text-muted-foreground")
                  }
                >
                  {state === "complete" ? (
                    <Check className="size-3" />
                  ) : (
                    <Icon className="size-3" />
                  )}
                </div>
              </div>
              <div className="mt-2 text-[10px] tracking-wider text-muted-foreground">
                STEP {i + 1}
              </div>
              <div className="text-sm font-semibold text-foreground whitespace-nowrap">
                {s.title}
              </div>
            </div>

            {i < steps.length - 1 && (
              <div
                className={
                  "h-1 w-4 rounded " +
                  (i < step
                    ? "bg-green-500"
                    : i === step
                      ? "bg-primary/70"
                      : "bg-muted")
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

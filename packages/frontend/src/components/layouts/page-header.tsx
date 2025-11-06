import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

type PageHeaderProps = {
  className?: string;
  title: string;
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  backUrl?: string;
};

export default function PageHeader({
  className,
  title,
  titleLevel = 2,
  description,
  meta,
  actions,
  backUrl,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between w-full",
        className
      )}
    >
      <div className="flex flex-row gap-6 items-center min-h-9 w-full">
        {backUrl && (
          <Link href={backUrl}>
            <Button variant="ghost">
              <ArrowLeft />
            </Button>
          </Link>
        )}
        <div className="flex flex-col">
          <h2
            className={cn("text-2xl font-gilroy font-bold", {
              "text-2xl": titleLevel === 1,
              "text-xl": titleLevel === 2,
              "text-lg": titleLevel === 3,
              "text-base": titleLevel === 4,
              "text-sm": titleLevel === 5,
              "text-xs": titleLevel === 6,
            })}
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {meta}
      </div>
      {actions}
    </div>
  );
}

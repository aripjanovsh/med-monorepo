import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

type PageHeaderProps = {
  className?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  backUrl?: string;
};

export default function PageHeader({
  className,
  title,
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
          <h1 className="text-2xl font-gilroy font-bold">{title}</h1>
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

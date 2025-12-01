"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { SidebarPanel } from "@/components/sidebar-panel/sidebar-panel";
import { cn } from "@/lib/utils";

type LayoutHeaderProps = {
  title?: ReactNode;
  backHref?: string;
  backTitle?: string;
  onBack?: () => void;
  left?: ReactNode;
  right?: ReactNode;
  border?: boolean;
};

export const LayoutHeader = ({
  title,
  backHref,
  backTitle,
  onBack,
  left,
  right,
  border = false,
}: LayoutHeaderProps) => {
  const router = useRouter();
  const showBack = Boolean(backHref || onBack);

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 px-4 md:gap-4 md:px-6",
        {
          "md:px-4": showBack,
          "border-b": border || showBack,
        }
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {left ? <div>{left}</div> : null}
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onBack) onBack();
                else if (backHref) router.push(backHref);
                else router.back();
              }}
            >
              <ArrowLeft />
              {backTitle}
            </Button>
          ) : null}
          <h1 className="text-lg font-gilroy font-bold">{title}</h1>
          {right ? (
            <div className="ml-auto flex items-center gap-2">{right}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export const CabinetContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <>
      <main className={cn("flex-1 p-6 rounded-lg", className)}>{children}</main>
    </>
  );
};

export const CabinetLayout = ({
  children,
  className,
  title,
  backHref,
  backTitle,
  onBack,
  right,
}: {
  children: React.ReactNode;
  className?: string;
  title?: ReactNode;
  backHref?: string;
  backTitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) => {
  return (
    <>
      <LayoutHeader
        title={title}
        backHref={backHref}
        backTitle={backTitle}
        onBack={onBack}
        right={right}
      />
      <main className={cn("flex-1 p-6 rounded-lg", className)}>{children}</main>
    </>
  );
};

export const Cabinet = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <SidebarPanel />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

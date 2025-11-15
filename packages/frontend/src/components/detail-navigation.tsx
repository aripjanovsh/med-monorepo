"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  value: string;
};

type DetailNavigationProps = {
  items: NavItem[];
  baseHref: string;
};

export const DetailNavigation = ({
  items,
  baseHref,
}: DetailNavigationProps) => {
  const pathname = usePathname();

  return (
    <div className="-mx-6 px-4 border-b">
      <nav className="inline-flex items-center justify-start gap-2 w-full pb-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.value === "overview" && pathname === baseHref);

          return (
            <Link
              key={item.value}
              href={item.href}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap text-sm font-gilroy font-semibold transition-all px-2 py-1 gap-2 rounded-md relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <div
                aria-hidden="true"
                className={cn(
                  "rounded-t-2xl absolute -bottom-[4px] h-[2px] bg-primary left-2 right-2",
                  isActive ? "block" : "hidden",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

"use client";

import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

type OptionSwitcherOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  icon?: ReactElement;
};

type OptionSwitcherProps<T extends string = string> = {
  options: OptionSwitcherOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export const OptionSwitcher = <T extends string = string>({
  options,
  value,
  onChange,
  className,
}: OptionSwitcherProps<T>) => {
  return (
    <div
      className={cn(
        "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
        // Badge styling overrides
        "[&_[data-slot=badge]]:bg-muted-foreground/30 [&_[data-slot=badge]]:size-5 [&_[data-slot=badge]]:rounded-full [&_[data-slot=badge]]:px-1",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          data-state={value === option.value ? "active" : "inactive"}
          className={cn(
            "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] hover:text-foreground/80 focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            "data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=active]:bg-input/30 dark:data-[state=active]:border-input dark:data-[state=active]:text-foreground"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};

"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

type OptionSwitcherOption<T extends string = string> = {
  value: T;
  label: string;
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
        "inline-flex items-center justify-start rounded-lg bg-muted p-[2px] w-fit",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap text-sm font-normal transition-all disabled:pointer-events-none px-2 py-1 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2 text-muted-foreground disabled:opacity-50 rounded-md",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-gilroy font-semibold",
            value === option.value && "bg-background shadow text-foreground"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};

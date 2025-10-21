import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

function Input({ className, type, left, right, ...props }: InputProps) {
  return (
    <label
      className={cn(
        "flex-row gap-3 flex h-9 w-full items-center px-3 rounded-md border border-input bg-background transition-colors focus-within:ring-1 focus-within:ring-ring",
        className,
        props.disabled && "opacity-50"
      )}
    >
      {left && (
        <div className="flex h-full items-center text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
          {left}
        </div>
      )}
      <input
        className={cn(
          "h-full flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
        )}
        type={type}
        {...props}
      />
      {right && (
        <div className="h-full flex items-center text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
          {right}
        </div>
      )}
    </label>
  );
}

export { Input };

"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsListVariants = cva("inline-flex items-center justify-start h-9", {
  variants: {
    variant: {
      default: "rounded-lg bg-muted p-1 w-fit",
      underline: "border-b rounded-none gap-2 w-full",
    },
    size: {
      default: "h-9",
      sm: "h-8 text-xs",
      lg: "h-10",
      icon: "h-9 w-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof TabsListVariants> {
  contentClassName?: string;
  asChild?: boolean;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, contentClassName, variant, children, size, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={className} {...props}>
    <div
      className={cn(
        TabsListVariants({ variant, size, className: contentClassName })
      )}
    >
      {children}
    </div>
  </TabsPrimitive.List>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-normal transition-all disabled:pointer-events-none data-[state=active]:text-foreground px-2 py-1 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2 text-muted-foreground disabled:opacity-50 rounded-md",
  {
    variants: {
      variant: {
        default:
          "data-[state=active]:bg-background data-[state=active]:shadow ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

        underline:
          "data-[state=active]:text-primary font-medium relative hover:bg-muted font-gilroy font-semibold data-[state=active]:[&>div]:block",
      },
      size: {
        default: "",
        sm: "text-xs",
        lg: "",
        icon: "h-9 w-9",
      },
      width: {
        default: "w-fit",
        fit: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "default",
    },
  }
);

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof TabsTriggerVariants> {
  asChild?: boolean;
  value: string;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, children, width, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(TabsTriggerVariants({ variant, size, width, className }))}
    {...props}
  >
    <div
      aria-hidden="true"
      className="rounded-t-2xl absolute -bottom-[4px] h-[2px] bg-primary data-[state=active]:block hidden left-2 right-2"
    />
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };

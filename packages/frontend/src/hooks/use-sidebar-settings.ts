"use client";

import { useCallback, useEffect, useState } from "react";

export type SidebarBehavior = "expanded" | "collapsed";

const SIDEBAR_BEHAVIOR_KEY = "sidebar_behavior";

export const useSidebarSettings = () => {
  const [behavior, setBehaviorState] = useState<SidebarBehavior>("expanded");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(
      SIDEBAR_BEHAVIOR_KEY
    ) as SidebarBehavior | null;
    if (stored) {
      setBehaviorState(stored);
    }
  }, []);

  const setBehavior = useCallback((value: SidebarBehavior) => {
    setBehaviorState(value);
    localStorage.setItem(SIDEBAR_BEHAVIOR_KEY, value);
    // Dispatch a custom event so other components can react
    window.dispatchEvent(
      new CustomEvent("sidebar-behavior-change", { detail: value })
    );
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const handleBehaviorChange = (event: CustomEvent<SidebarBehavior>) => {
      setBehaviorState(event.detail);
    };

    window.addEventListener(
      "sidebar-behavior-change",
      handleBehaviorChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "sidebar-behavior-change",
        handleBehaviorChange as EventListener
      );
    };
  }, []);

  return { behavior, setBehavior, mounted };
};

export const getSidebarBehavior = (): SidebarBehavior => {
  if (typeof window === "undefined") return "expanded";
  return (
    (localStorage.getItem(SIDEBAR_BEHAVIOR_KEY) as SidebarBehavior) ??
    "expanded"
  );
};

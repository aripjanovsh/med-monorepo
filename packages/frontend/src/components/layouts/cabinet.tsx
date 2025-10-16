"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarPanel } from "@/components/sidebar-panel/sidebar-panel";
import { SidebarPanelUser } from "@/components/sidebar-panel/sidebar-panel-user";
import { ThemeToggle } from "../theme-toggle";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

// Context and helper to allow pages to configure the header (title, back button, etc.)
type HeaderConfig = {
  title?: ReactNode;
  showBack?: boolean;
  backHref?: string;
  backTitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

const CabinetHeaderContext = createContext<{
  setHeader: (config: HeaderConfig | null) => void;
  clearHeader: () => void;
}>({
  setHeader: () => {},
  clearHeader: () => {},
});

export function useCabinetHeader() {
  const ctx = useContext(CabinetHeaderContext);
  return {
    setHeader: ctx.setHeader,
    clearHeader: ctx.clearHeader,
  };
}

interface LayoutHeaderProps {
  title?: ReactNode;
  backHref?: string;
  backTitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function LayoutHeader({
  title,
  backHref,
  backTitle,
  onBack,
  right,
}: LayoutHeaderProps) {
  const { setHeader, clearHeader } = useCabinetHeader();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setHeader({
      title,
      showBack: Boolean(backHref || onBack),
      backHref,
      backTitle,
      onBack,
      right,
    });
    return () => {
      clearHeader();
    };
    // We intentionally run this only on mount/unmount to avoid infinite loops
    // when unstable ReactNode props (like `right`) change identity each render.
    // For dynamic updates, call `useCabinetHeader().setHeader(...)` from the page.
  }, []);
  return null;
}

function CabinetContent({ children }: { children: React.ReactNode }) {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
  const router = useRouter();
  const clearHeader = useCallback(() => setHeaderConfig(null), []);
  const contextValue = useMemo(
    () => ({ setHeader: setHeaderConfig, clearHeader }),
    [clearHeader]
  );

  return (
    <SidebarProvider>
      <SidebarPanel />
      <SidebarInset>
        <CabinetHeaderContext.Provider value={contextValue}>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 md:gap-4 md:px-4">
            <div className="flex-1 min-w-0">
              {headerConfig && (
                <div className="flex items-center gap-2 min-w-0">
                  {headerConfig.showBack ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (headerConfig.onBack) headerConfig.onBack();
                        else if (headerConfig.backHref)
                          router.push(headerConfig.backHref);
                        else router.back();
                      }}
                    >
                      <ArrowLeft />
                      {headerConfig.backTitle}
                    </Button>
                  ) : null}
                  <h1 className="text-xl font-gilroy font-bold pl-2">
                    {headerConfig.title}
                  </h1>
                  {/* <h1 className="truncate text-base font-semibold font-gilroy md:text-lg"></h1> */}
                  {headerConfig.right ? (
                    <div className="ml-2 flex items-center gap-2">
                      {headerConfig.right}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            {/* <div className="flex-1">
              <HeaderSearch />
            </div> */}
            <div className="flex items-center gap-4 ml-auto md:gap-1 flex-1 justify-end">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell />
              </Button>
              <SidebarPanelUser />
            </div>
          </header>

          <main className="flex-1 p-6 rounded-lg">{children}</main>
        </CabinetHeaderContext.Provider>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function Cabinet({ children }: { children: React.ReactNode }) {
  return <CabinetContent>{children}</CabinetContent>;
}

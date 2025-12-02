"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SIDEBAR_PANEL_NAV_MENU } from "@/components/sidebar-panel/sidebar-panel.menu";
import { ComponentProps } from "react";
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  GalleryVerticalEnd,
  HelpCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/route.constants";
import { SidebarPanelUser } from "./sidebar-panel-user";
import { cn } from "@/lib/utils";

export function SidebarPanel({ ...props }: ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="p-0">
        <Link
          href="/cabinet"
          className={cn("flex items-center gap-2 pl-2 py-2", {
            "pl-3": !isCollapsed,
          })}
        >
          <div className="bg-black dark:bg-white text-white dark:text-black flex min-w-[32px] items-center justify-center rounded-md min-h-[32px]">
            <GalleryVerticalEnd className="size-5" />
          </div>
          {!isCollapsed && (
            <span className="text-2xl font-gilroy font-bold">datadoc.</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_PANEL_NAV_MENU.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.children?.map((child) => (
                  <SidebarMenuItem key={child.title}>
                    <SidebarMenuButton asChild tooltip={child.title}>
                      <Link href={child.url ?? "/"}>
                        {child.icon && <child.icon />}
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Уведомления">
                  <Link href={ROUTES.NOTIFICATIONS}>
                    <Bell />
                    <span>Уведомления</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Настройки">
                  <Link href={ROUTES.SETTINGS}>
                    <Settings />
                    <span>Настройки</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={isCollapsed ? "Развернуть" : "Свернуть"}
                  onClick={toggleSidebar}
                >
                  {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
                  <span>{isCollapsed ? "Развернуть" : "Свернуть"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarPanelUser />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

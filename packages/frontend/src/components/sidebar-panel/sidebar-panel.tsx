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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SIDEBAR_PANEL_NAV_MENU } from "@/components/sidebar-panel/sidebar-panel.menu";
import { ComponentProps } from "react";
import { Bell, HelpCircle, Settings, Stethoscope } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/route.constants";

export function SidebarPanel({ ...props }: ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="relative p-0 flex flex-row justify-between items-center">
        <Link href="/" className="flex items-center gap-2 px-3 py-2">
          <Stethoscope className="size-5 text-primary" />
          {state !== "collapsed" && (
            <span className="text-lg font-gilroy font-bold">MaxiMed</span>
          )}
        </Link>

        <SidebarTrigger className="-ml-1" />
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_PANEL_NAV_MENU.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.children?.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url ?? "/"}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
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
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.NOTIFICATIONS}>
                    <Bell />
                    Notifications
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.SETTINGS}>
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="mb-2">
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.HELP}>
                    <HelpCircle />
                    Help Center
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarPanelNavModel } from "@/components/sidebar-panel/sidebar-panel.model";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DEFAULT_ROUTE = "/";

export function SidebarPanelNav({ menu }: { menu: SidebarPanelNavModel[] }) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  // Функция для проверки активности элемента
  const isActive = (url: string) => {
    return url === DEFAULT_ROUTE
      ? pathname === DEFAULT_ROUTE
      : pathname === url || pathname.startsWith(url);
  };

  // Отрисовка пунктов с дочерними элементами
  const renderDropdownItem = (item: SidebarPanelNavModel) => (
    <DropdownMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} size="lg">
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          side="right"
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {item.title}
          </DropdownMenuLabel>
          {item.children?.map((subItem) => (
            <DropdownMenuItem asChild key={subItem.title}>
              <Link href={subItem.url || "/"}>
                <span>{subItem.title}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </SidebarMenuItem>
    </DropdownMenu>
  );

  // Отрисовка пунктов с дочерними элементами для состояния "развернуто"
  const renderCollapsibleItem = (item: SidebarPanelNavModel) => (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={item.children?.some((child) => isActive(child.url || ""))}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} size="lg">
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isActive(subItem.url || "")}
                  size="md"
                >
                  <Link href={subItem.url || "/"}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );

  // Отрисовка одиночных пунктов
  const renderMenuItem = (item: SidebarPanelNavModel) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        tooltip={item.title}
        asChild
        isActive={isActive(item.url!)}
        size="lg"
        className="font-gilroy font-semibold"
      >
        <Link href={item.url!}>
          {item.icon && <item.icon />}
          {state !== "collapsed" && <span>{item.title}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  // Основная отрисовка меню
  return (
    <SidebarGroup>
      <SidebarMenu>
        {menu.map((item) =>
          item.children?.length
            ? state === "collapsed" && !isMobile
              ? renderDropdownItem(item)
              : renderCollapsibleItem(item)
            : renderMenuItem(item)
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

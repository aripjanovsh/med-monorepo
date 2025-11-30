"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useMe } from "@/features/auth/use-me";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export function SidebarPanelUser() {
  const { t } = useTranslation();
  const { user } = useMe();
  const { isMobile, state } = useSidebar();

  const fullName = [user?.lastName, user?.firstName].filter(Boolean).join(" ");
  const avatarId = user?.avatarId ?? user?.employee?.avatarId;

  return (
    <SidebarMenu className="mt-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
                avatarId={avatarId}
                name={fullName}
                className="h-8 w-8 rounded-md"
                size={32}
                fallbackClassName="rounded-md text-xs"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <UserAvatar
                  avatarId={avatarId}
                  name={fullName}
                  className="h-8 w-8 rounded-md"
                  size={32}
                  fallbackClassName="rounded-md"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/cabinet/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("Профиль")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/logout" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("Выйти")}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

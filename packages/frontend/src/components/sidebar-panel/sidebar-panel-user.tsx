"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useMe } from "@/features/auth/use-me";
import { Bell, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export function SidebarPanelUser() {
  const { t } = useTranslation();
  const { user } = useMe();

  const fullName = [user?.lastName, user?.firstName].filter(Boolean).join(" ");
  const avatarId = user?.avatarId ?? user?.employee?.avatarId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserAvatar
            avatarId={avatarId}
            name={fullName}
            className="h-7 w-7 rounded-md"
            size={28}
            fallbackClassName="rounded-md text-xs"
          />
          {/* <div className="hidden md:grid text-left text-sm leading-none">
            <span className="font-medium">{fullName}</span>
            <span className="text-xs text-muted-foreground">{user?.role}</span>
          </div> */}
          {/* <ChevronsUpDown className="hidden h-4 w-4 opacity-50 md:block" /> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-lg"
        align="end"
        side="bottom"
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
            <div className="grid flex-1 text-left text-sm leading-none">
              <span className="font-medium">{fullName}</span>
              <span className="text-xs text-muted-foreground">
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
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            <span>{t("Уведомления")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"/logout"} className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("Выйти")}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

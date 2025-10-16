"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useMe } from "@/features/auth/use-me";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export function SidebarPanelUser() {
  const { t } = useTranslation();
  const { user } = useMe();

  const fullName = [user?.lastName, user?.firstName].filter(Boolean).join(" ");
  const initials = [user?.lastName?.slice(0, 1), user?.firstName?.slice(0, 1)]
    .filter(Boolean)
    .join(" ");

  const avatar = "/avatars/shadcn.jpg";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarImage src={avatar} alt={fullName} />
            <AvatarFallback className="rounded-md text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
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
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarImage src={avatar} alt={fullName} />
              <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
            </Avatar>
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
          <DropdownMenuItem>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Upgrade to Pro</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
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

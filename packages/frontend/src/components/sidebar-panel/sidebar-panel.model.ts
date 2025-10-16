import type { LucideIcon } from "lucide-react";

export interface SidebarPanelTenantModel {
  id: string;
  name: string;
  avatar?: string;
}

export interface SidebarPanelNavModel {
  title: string;
  url?: string;
  icon?: LucideIcon;
  children?: SidebarPanelNavModel[];
}

export interface SidebarPanelUserModel {
  name: string;
  email: string;
  avatar?: string;
}

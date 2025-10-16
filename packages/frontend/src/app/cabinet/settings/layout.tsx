"use client";

import { usePathname } from "next/navigation";
import PageHeader from "@/components/layouts/page-header";
import { SidebarNav } from "@/components/layouts/sidebar-nav";

import {
  Users,
  Building2,
  Shield,
  Bell,
  CreditCard,
  Lock,
  Zap,
  ChevronRight,
  FileText,
  Database,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const settingsSections = [
  {
    id: "company" as const,
    label: "Company Settings",
    icon: Building2,
    description: "Basic company information and branding",
    href: "/cabinet/settings/company",
  },
  {
    id: "protocols" as const,
    label: "Protocol Templates",
    icon: FileText,
    description: "Manage medical protocol templates",
    href: "/cabinet/settings/protocols",
  },
  {
    id: "master-data" as const,
    label: "Master Data",
    icon: Database,
    description: "Manage reference data and dictionaries",
    href: "/cabinet/settings/master-data",
  },
  {
    id: "roles" as const,
    label: "Roles & Permissions",
    icon: Shield,
    description: "Manage user roles and access permissions",
    href: "/cabinet/settings/roles",
  },
  {
    id: "users" as const,
    label: "User Management",
    icon: Users,
    description: "Manage users and their access",
    href: "/cabinet/settings/users",
  },
  {
    id: "notifications" as const,
    label: "Notifications",
    icon: Bell,
    description: "Configure notification preferences",
    href: "/cabinet/settings/notifications",
  },
  {
    id: "security" as const,
    label: "Security",
    icon: Lock,
    description: "Security settings and authentication",
    href: "/cabinet/settings/security",
  },
  {
    id: "integrations" as const,
    label: "Integrations",
    icon: Zap,
    description: "Third-party integrations and APIs",
    href: "/cabinet/settings/integrations",
  },
  {
    id: "billing" as const,
    label: "Billing",
    icon: CreditCard,
    description: "Subscription and payment settings",
    href: "/cabinet/settings/billing",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get current section based on pathname
  const currentSection = settingsSections.find((section) =>
    pathname.startsWith(section.href)
  );

  const subtitle = currentSection?.label;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <div className="flex flex-row gap-4 items-center min-h-9 w-full">
          <h1 className="text-2xl font-gilroy font-bold">Settings</h1>
          {subtitle && (
            <div className="flex flex-row items-center gap-2">
              <ChevronRight className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          )}
        </div>
      </div>
      <Separator className="-mx-6 w-full" />

      <div className="flex flex-col lg:flex-row space-x-6 lg:space-y-0 h-full -mb-6">
        <aside className="-mx-4 lg:w-1/7 border-r border-border h-full pt-4 pr-6">
          <SidebarNav
            items={settingsSections.map((section) => ({
              href: section.href,
              title: section.label,
              icon: <section.icon />,
            }))}
          />
        </aside>
        <div className="flex-1 py-4">{children}</div>
      </div>
    </div>
  );
}

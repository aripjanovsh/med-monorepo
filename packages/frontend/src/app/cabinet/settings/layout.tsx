"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Building2,
  Shield,
  Bell,
  CreditCard,
  Lock,
  Zap,
  Database,
} from "lucide-react";
import Link from "next/link";

export type SettingsSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  href: string;
};

export const settingsSections: SettingsSection[] = [
  {
    id: "company",
    label: "Company Settings",
    icon: Building2,
    description: "Basic company information and branding",
    href: "/cabinet/settings/company",
  },
  {
    id: "master-data",
    label: "Справочные данные",
    icon: Database,
    description: "Manage reference data and dictionaries",
    href: "/cabinet/settings/master-data",
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    icon: Shield,
    description: "Manage user roles and access permissions",
    href: "/cabinet/settings/roles",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    description: "Manage users and their access",
    href: "/cabinet/settings/users",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Configure notification preferences",
    href: "/cabinet/settings/notifications",
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    description: "Security settings and authentication",
    href: "/cabinet/settings/security",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Zap,
    description: "Third-party integrations and APIs",
    href: "/cabinet/settings/integrations",
  },
  {
    id: "billing",
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
  const router = useRouter();

  const isMainPage = pathname === "/cabinet/settings";

  // Get current section based on pathname
  const currentSection = settingsSections.find((section) =>
    pathname.startsWith(section.href)
  );

  const isMasterDataPage = pathname.startsWith("/cabinet/settings/master-data");

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <div className="flex flex-row gap-2 items-center min-h-9 w-full">
          {isMainPage && (
            <h1 className="text-2xl font-gilroy font-bold">Настройки</h1>
          )}
          {!isMainPage && !isMasterDataPage && currentSection && (
            <>
              <Link href="/cabinet/settings">
                <h1 className="text-2xl font-gilroy font-bold">Настройки</h1>
              </Link>
              <ChevronRight className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {currentSection.label}
              </p>
            </>
          )}

          {!isMainPage && isMasterDataPage && currentSection && (
            <>
              <Link href="/cabinet/settings">
                <h1 className="text-2xl font-gilroy font-bold">Настройки</h1>
              </Link>
              <ChevronRight className="size-4 text-muted-foreground" />
              <Link href="/cabinet/settings/master-data">
                <p className="text-sm text-muted-foreground">
                  {currentSection.label}
                </p>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}

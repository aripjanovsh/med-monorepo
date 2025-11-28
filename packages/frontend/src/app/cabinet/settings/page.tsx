"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import {
  Users,
  Building2,
  Shield,
  Bell,
  CreditCard,
  Lock,
  Zap,
  Database,
  type LucideIcon,
} from "lucide-react";
import PageHeader from "@/components/layouts/page-header";

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
    label: "Компания",
    icon: Building2,
    description: "Основная информация о компании",
    href: "/cabinet/settings/company",
  },
  {
    id: "master-data",
    label: "Справочные данные",
    icon: Database,
    description: "Управление справочными данными",
    href: "/cabinet/settings/master-data",
  },
  {
    id: "roles",
    label: "Роли и права",
    icon: Shield,
    description: "Управление ролями и правами",
    href: "/cabinet/settings/roles",
  },
  {
    id: "users",
    label: "Пользователи",
    icon: Users,
    description: "Управление пользователями",
    href: "/cabinet/settings/users",
  },
  {
    id: "notifications",
    label: "Уведомления",
    icon: Bell,
    description: "Управление уведомлениями",
    href: "/cabinet/settings/notifications",
  },
  {
    id: "security",
    label: "Безопасность",
    icon: Lock,
    description: "Безопасность и аутентификация",
    href: "/cabinet/settings/security",
  },
  {
    id: "integrations",
    label: "Интеграции",
    icon: Zap,
    description: "Интеграции и API",
    href: "/cabinet/settings/integrations",
  },
  {
    id: "billing",
    label: "Платежи",
    icon: CreditCard,
    description: "Управление подпиской и платежами",
    href: "/cabinet/settings/billing",
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Настройки"
        description="Управление настройками организации"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <Card
              key={section.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
              onClick={() => router.push(section.href)}
            >
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-6" />
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {section.label}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

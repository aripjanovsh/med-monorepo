"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Wrench,
  Globe,
  Languages,
  Building2,
  Stethoscope,
  FileText,
  FlaskConical,
  Calendar,
  Ban,
} from "lucide-react";
import { ROUTES } from "@/constants/route.constants";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

const masterDataModules = [
  {
    title: "Шаблоны протоколов",
    description: "Управление шаблонами медицинских протоколов",
    icon: FileText,
    href: ROUTES.PROTOCOL_TEMPLATES,
    color: "text-cyan-600",
  },
  {
    title: "Шаблоны анализов",
    description: "Управление шаблонами лабораторных анализов",
    icon: FlaskConical,
    href: ROUTES.ANALYSIS_TEMPLATES,
    color: "text-pink-600",
  },
  {
    title: "Должности",
    description: "Управление должностями сотрудников",
    icon: Users,
    href: ROUTES.MASTER_DATA_TITLES,
    color: "text-blue-600",
  },
  {
    title: "Услуги",
    description: "Управление медицинскими услугами",
    icon: Stethoscope,
    href: ROUTES.MASTER_DATA_SERVICES,
    color: "text-emerald-600",
  },
  {
    title: "Отделения",
    description: "Управление отделениями медицинской организации",
    icon: Building2,
    href: ROUTES.MASTER_DATA_DEPARTMENTS,
    color: "text-indigo-600",
  },
  {
    title: "Языки",
    description: "Управление языками системы",
    icon: Languages,
    href: ROUTES.MASTER_DATA_LANGUAGES,
    color: "text-orange-600",
  },
  {
    title: "Типы приёма",
    description: "Управление типами записи на приём",
    icon: Calendar,
    href: ROUTES.MASTER_DATA_APPOINTMENT_TYPES,
    color: "text-teal-600",
  },
  {
    title: "Причины отмены",
    description: "Управление причинами отмены записей",
    icon: Ban,
    href: ROUTES.MASTER_DATA_APPOINTMENT_CANCEL_TYPES,
    color: "text-red-600",
  },
];

export default function MasterDataPage() {
  const router = useRouter();

  return (
    <>
      <LayoutHeader
        border
        left={
          <PageBreadcrumbs
            items={[
              { label: "Настройки", href: "/cabinet/settings" },
              { label: "Справочные данные" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Справочные данные"
          description="Управление справочными данными"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {masterDataModules.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.href}
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
                    {section.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CabinetContent>
    </>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Users, Wrench, Globe, Languages, Building2, Stethoscope, FileText, FlaskConical } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/route.constants";
import PageHeader from "@/components/layouts/page-header";

const masterDataModules = [
  {
    title: "Должности",
    description: "Управление должностями сотрудников",
    icon: Users,
    href: ROUTES.MASTER_DATA_TITLES,
    color: "text-blue-600",
  },
  {
    title: "Типы услуг",
    description: "Управление типами медицинских услуг",
    icon: Wrench,
    href: ROUTES.MASTER_DATA_SERVICE_TYPES,
    color: "text-green-600",
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
    title: "Геолокации",
    description: "Управление странами, регионами, городами и районами",
    icon: Globe,
    href: ROUTES.MASTER_DATA_GEOLOCATION,
    color: "text-purple-600",
  },
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
];

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Справочные данные"
        description="Управление основными справочными данными системы"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masterDataModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card
              key={module.href}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-8 w-8 ${module.color}`} />
                  <CardTitle>{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={module.href}>
                  <Button className="w-full">Перейти к управлению</Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Справочные данные используются во всей системе для обеспечения
              консистентности и стандартизации информации. Все изменения в
              справочных данных требуют соответствующих прав доступа.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

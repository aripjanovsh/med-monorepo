"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, CreditCard, Globe, Bell, Zap, Shield } from "lucide-react";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function IntegrationsSettingsPage() {
  return (
    <>
      <LayoutHeader
        border
        left={
          <PageBreadcrumbs
            items={[
              { label: "Настройки", href: "/cabinet/settings" },
              { label: "Интеграции" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6 max-w-4xl mx-auto">
        <PageHeader title="Интеграции" description="Интеграции и API" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              name: "Electronic Health Records",
              status: "connected",
              icon: Database,
              description: "Sync patient data automatically",
            },
            {
              name: "Payment Gateway",
              status: "connected",
              icon: CreditCard,
              description: "Process payments securely",
            },
            {
              name: "SMS Provider",
              status: "disconnected",
              icon: Globe,
              description: "Send appointment reminders",
            },
            {
              name: "Email Service",
              status: "connected",
              icon: Bell,
              description: "Automated email notifications",
            },
            {
              name: "Analytics Platform",
              status: "disconnected",
              icon: Zap,
              description: "Track performance metrics",
            },
            {
              name: "Backup Service",
              status: "connected",
              icon: Shield,
              description: "Secure data backups",
            },
          ].map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.name}
                className="bg-white rounded-2xl border border-gray-200/60 p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      integration.status === "connected"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-50 text-gray-400"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge
                    variant={
                      integration.status === "connected"
                        ? "default"
                        : "secondary"
                    }
                    className={cn(
                      "text-xs font-medium",
                      integration.status === "connected"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    )}
                  >
                    {integration.status}
                  </Badge>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {integration.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {integration.description}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg border-gray-200 hover:bg-gray-50 h-9"
                >
                  {integration.status === "connected" ? "Configure" : "Connect"}
                </Button>
              </div>
            );
          })}
        </div>
      </CabinetContent>
    </>
  );
}

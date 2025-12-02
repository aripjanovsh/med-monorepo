"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CabinetContent, LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function SecuritySettingsPage() {
  return (
    <>
      <LayoutHeader
        border
        left={
          <PageBreadcrumbs
            items={[
              { label: "Настройки", href: "/cabinet/settings" },
              { label: "Безопасность" },
            ]}
          />
        }
      />
      <CabinetContent className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Безопасность"
          description="Безопасность и аутентификация"
        />
        <div className="space-y-8">
          <div className="grid gap-8 xl:grid-cols-2">
            {/* Authentication */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Authentication
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-gray-900">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-gray-500">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-gray-900">
                      Single Sign-On (SSO)
                    </Label>
                    <p className="text-sm text-gray-500">
                      Enable SSO authentication
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-blue-500" />
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="py-4">
                  <Label
                    htmlFor="session-timeout"
                    className="text-base font-medium text-gray-900 mb-3 block"
                  >
                    Session Timeout
                  </Label>
                  <Select defaultValue="8">
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200">
                      <SelectItem value="2" className="rounded-lg">
                        2 hours
                      </SelectItem>
                      <SelectItem value="4" className="rounded-lg">
                        4 hours
                      </SelectItem>
                      <SelectItem value="8" className="rounded-lg">
                        8 hours
                      </SelectItem>
                      <SelectItem value="24" className="rounded-lg">
                        24 hours
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Data Protection
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-gray-900">
                      Data Encryption
                    </Label>
                    <p className="text-sm text-gray-500">
                      Encrypt sensitive patient data
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-gray-900">
                      Audit Logging
                    </Label>
                    <p className="text-sm text-gray-500">
                      Log all user activities
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="py-4">
                  <Label
                    htmlFor="backup-frequency"
                    className="text-base font-medium text-gray-900 mb-3 block"
                  >
                    Backup Frequency
                  </Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200">
                      <SelectItem value="hourly" className="rounded-lg">
                        Hourly
                      </SelectItem>
                      <SelectItem value="daily" className="rounded-lg">
                        Daily
                      </SelectItem>
                      <SelectItem value="weekly" className="rounded-lg">
                        Weekly
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CabinetContent>
    </>
  );
}

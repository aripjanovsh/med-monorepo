"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LayoutHeader } from "@/components/layouts/cabinet";
import PageHeader from "@/components/layouts/page-header";
import { PageBreadcrumbs } from "@/components/layouts/page-breadcrumbs";

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/settings" backTitle="Настройки" />
      <PageHeader title="Уведомления" description="Управление уведомлениями" />
      <PageBreadcrumbs
        items={[
          { label: "Настройки", href: "/cabinet/settings" },
          { label: "Уведомления" },
        ]}
      />
      <div className="space-y-8">
        <div className="grid gap-8 xl:grid-cols-2">
          {/* Email Notifications */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Email Notifications
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900">
                    Patient Appointments
                  </Label>
                  <p className="text-sm text-gray-500">
                    New patient bookings and changes
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
                    System Updates
                  </Label>
                  <p className="text-sm text-gray-500">
                    Important system announcements
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
                    Security Alerts
                  </Label>
                  <p className="text-sm text-gray-500">
                    Login attempts and security events
                  </p>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Push Notifications
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900">
                    Emergency Alerts
                  </Label>
                  <p className="text-sm text-gray-500">
                    Critical patient notifications
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
                    Reminders
                  </Label>
                  <p className="text-sm text-gray-500">
                    Task and appointment reminders
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-blue-500" />
              </div>

              <div className="h-px bg-gray-200"></div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900">
                    Team Messages
                  </Label>
                  <p className="text-sm text-gray-500">
                    Messages from team members
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompanySettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-8">
        <div className="grid gap-8 xl:grid-cols-2">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Basic Information
              </h3>
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="company-name"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Company Name
                  </Label>
                  <Input id="company-name" defaultValue="MaxMed Healthcare" />
                </div>
                <div>
                  <Label htmlFor="company-email">Email Address</Label>
                  <Input
                    id="company-email"
                    type="email"
                    defaultValue="info@maxmed.com"
                  />
                </div>
                <div>
                  <Label htmlFor="company-phone">Phone Number</Label>
                  <Input id="company-phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="company-address">Address</Label>
                  <Input
                    id="company-address"
                    defaultValue="123 Medical Center Dr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Branding & Appearance
              </h3>
              <div className="space-y-6">
                <div>
                  <Label>Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center border border-blue-200/50">
                      <Building2 className="w-10 h-10 text-blue-600" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-9 border-gray-200 hover:bg-gray-50"
                      >
                        Change Logo
                      </Button>
                      <span className="text-xs text-gray-500">
                        PNG, JPG up to 2MB
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl border border-gray-200 shadow-sm"></div>
                    <Input id="primary-color" defaultValue="#3B82F6" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">
                        UTC (Coordinated Universal Time)
                      </SelectItem>
                      <SelectItem value="est">
                        EST (Eastern Standard Time)
                      </SelectItem>
                      <SelectItem value="pst">
                        PST (Pacific Standard Time)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-100">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

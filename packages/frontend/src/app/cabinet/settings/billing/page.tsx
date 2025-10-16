"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function BillingSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="grid gap-8 xl:grid-cols-2">
          {/* Current Plan */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Current Plan
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">
                  Professional Plan
                </h4>
                <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                  Active
                </Badge>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">$99</div>
                <div className="text-gray-600">per month</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  Up to 100 users
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  Advanced reporting
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  24/7 support
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  API access
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-200 hover:bg-white"
                >
                  Change Plan
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Method
            </h3>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white text-xs font-medium flex items-center justify-center">
                    VISA
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      **** **** **** 4242
                    </div>
                    <div className="text-sm text-gray-500">Expires 12/25</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-xl border-gray-200 hover:bg-gray-50 h-11"
                >
                  Update Payment Method
                </Button>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Billing Email
                </Label>
                <Input
                  defaultValue="billing@maxmed.com"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-12 text-base"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Next billing date
                </div>
                <div className="text-sm text-gray-600">December 15, 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

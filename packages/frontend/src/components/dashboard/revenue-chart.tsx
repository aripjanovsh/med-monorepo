"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign } from "lucide-react";
import { MonthlyRevenue } from "@/types/dashboard";

interface RevenueChartProps {
  data: MonthlyRevenue[];
  trend: number;
  totalRevenue: number;
}

export function RevenueChart({ data, trend, totalRevenue }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Revenue Overview
          </CardTitle>
          <Badge variant="outline" className="text-green-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            +{trend}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Revenue Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data[0]?.appointments || 0}</p>
              <p className="text-xs text-muted-foreground">Appointments</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${Math.round(totalRevenue / (data[0]?.appointments || 1))}
              </p>
              <p className="text-xs text-muted-foreground">Avg per Visit</p>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Last 6 Months</h4>
            <div className="space-y-2">
              {data.map((month, index) => {
                const percentage = (month.revenue / maxRevenue) * 100;
                const isCurrentMonth = index === 0;
                
                return (
                  <div key={month.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isCurrentMonth ? "font-medium" : "text-muted-foreground"}>
                        {month.month}
                      </span>
                      <span className={isCurrentMonth ? "font-medium" : "text-muted-foreground"}>
                        ${month.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCurrentMonth ? "bg-blue-600" : "bg-blue-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Revenue Breakdown</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultations</span>
                <span className="font-medium">88%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products</span>
                <span className="font-medium">9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other</span>
                <span className="font-medium">3%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
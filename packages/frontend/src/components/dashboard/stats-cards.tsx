"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
} from "lucide-react";
import { DashboardStats } from "@/types/dashboard";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Patients",
      value: stats.patients.total.toLocaleString(),
      subtitle: `${stats.patients.newThisMonth} new this month`,
      icon: Users,
      trend: stats.patients.trend,
      color: "blue",
    },
    {
      title: "Appointments",
      value: stats.appointments.today.toString(),
      subtitle: `${stats.appointments.thisWeek} this week`,
      icon: Calendar,
      trend: stats.appointments.trend,
      color: "green",
    },
    {
      title: "Revenue",
      value: `$${stats.revenue.thisMonth.toLocaleString()}`,
      subtitle: `$${stats.revenue.today.toLocaleString()} today`,
      icon: DollarSign,
      trend: stats.revenue.trend,
      color: "purple",
    },
    {
      title: "Active Staff",
      value: stats.employees.active.toString(),
      subtitle: `${stats.employees.doctors} doctors`,
      icon: Activity,
      trend: 0,
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
      teal: "text-teal-600",
    };
    return colors[color] || "text-gray-600";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return TrendingUp;
    if (trend < 0) return TrendingDown;
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const TrendIcon = getTrendIcon(card.trend);
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{card.value}</p>
                    {card.trend !== 0 && TrendIcon && (
                      <div className={`flex items-center ${getTrendColor(card.trend)}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-xs font-medium ml-1">
                          {Math.abs(card.trend)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`${getColorClasses(card.color)}`}>
                  <IconComponent className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
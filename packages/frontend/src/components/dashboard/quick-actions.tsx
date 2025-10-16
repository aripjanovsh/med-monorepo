"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  UserPlus, 
  Zap, 
  BarChart3, 
  Clock, 
  Package,
  ArrowRight,
} from "lucide-react";
import { QuickAction } from "@/types/dashboard";

interface QuickActionsProps {
  actions: QuickAction[];
}

const iconMap = {
  Calendar,
  UserPlus,
  Zap,
  BarChart3,
  Clock,
  Package,
};

export function QuickActions({ actions }: QuickActionsProps) {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", hover: "hover:bg-blue-100" },
      green: { bg: "bg-green-50", text: "text-green-600", hover: "hover:bg-green-100" },
      red: { bg: "bg-red-50", text: "text-red-600", hover: "hover:bg-red-100" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", hover: "hover:bg-purple-100" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", hover: "hover:bg-orange-100" },
      teal: { bg: "bg-teal-50", text: "text-teal-600", hover: "hover:bg-teal-100" },
    };
    return colors[color] || colors.blue;
  };

  const handleAction = (action: string) => {
    // In a real app, this would navigate to the specified route
    console.log(`Navigating to: ${action}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const IconComponent = iconMap[action.icon as keyof typeof iconMap];
            const colorClasses = getColorClasses(action.color);
            
            return (
              <Button
                key={action.id}
                variant="ghost"
                className={`h-auto p-4 ${colorClasses.bg} ${colorClasses.hover} border border-transparent hover:border-gray-200`}
                onClick={() => handleAction(action.action)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`${colorClasses.text} flex-shrink-0`}>
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
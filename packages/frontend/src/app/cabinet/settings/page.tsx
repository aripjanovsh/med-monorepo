"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { settingsSections } from "./layout";
import { ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Manage your organization settings and preferences
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <Card
              key={section.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
              onClick={() => router.push(section.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-6" />
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {section.label}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

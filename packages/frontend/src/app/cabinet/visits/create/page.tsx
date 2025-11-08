"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

import { VisitForm } from "@/features/visit/components/visit-form";
import { ROUTES } from "@/constants/route.constants";

export default function CreateVisitPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.VISITS)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Начать новый прием</h1>
          <p className="text-muted-foreground">Создание визита для пациента</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о визите</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

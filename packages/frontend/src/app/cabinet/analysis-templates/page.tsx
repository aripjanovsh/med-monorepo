"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisTemplatesList } from "@/components/analysis-templates/analysis-templates-list";
import { CreateAnalysisTemplateEnhanced } from "@/components/analysis-templates/create-analysis-template-enhanced";

export default function AnalysisTemplatesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Шаблоны анализов</h1>
          <p className="text-muted-foreground">
            Управление шаблонами лабораторных анализов
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать шаблон
        </Button>
      </div>

      {showCreateForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Создание нового шаблона анализа</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateAnalysisTemplateEnhanced
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <AnalysisTemplatesList />
      )}
    </div>
  );
}

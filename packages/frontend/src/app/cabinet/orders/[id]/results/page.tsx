"use client";

import { use } from "react";
import { Printer, Download } from "lucide-react";
import { differenceInYears } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  useGetServiceOrderQuery,
  AnalysisResultView,
  ProtocolResultView,
} from "@/features/service-order";
import type {
  SavedAnalysisData,
  SavedProtocolData,
} from "@/features/service-order";

export default function ServiceOrderResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);

  const { data: order } = useGetServiceOrderQuery(orderId);

  if (!order) return null;

  // Parse result data to determine type
  const parseResultData = (): {
    type: "text" | "analysis" | "protocol" | null;
    analysisData: SavedAnalysisData | null;
    protocolData: SavedProtocolData | null;
  } => {
    if (!order.resultData) {
      return {
        type: order.resultText ? "text" : null,
        analysisData: null,
        protocolData: null,
      };
    }

    const data = order.resultData as any;

    // Check for SavedAnalysisData
    if (
      "filledData" in data &&
      "templateContent" in data &&
      "rows" in data.filledData
    ) {
      return {
        type: "analysis",
        analysisData: data as SavedAnalysisData,
        protocolData: null,
      };
    }

    // Check for SavedProtocolData
    if (
      "filledData" in data &&
      "templateContent" in data &&
      !("rows" in data.filledData)
    ) {
      return {
        type: "protocol",
        analysisData: null,
        protocolData: data as SavedProtocolData,
      };
    }

    return { type: null, analysisData: null, protocolData: null };
  };

  const { type: resultType, analysisData, protocolData } = parseResultData();

  // Calculate patient age
  const patientAge = order.patient.dateOfBirth
    ? differenceInYears(new Date(), new Date(order.patient.dateOfBirth))
    : undefined;

  const hasResults =
    order.resultText || order.resultData || order.resultFileUrl;

  if (!hasResults) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Результаты еще не добавлены</p>
            <p className="text-sm mt-2">
              Результаты появятся после выполнения назначения
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between h-14">
          <h2 className="text-xl font-gilroy font-bold leading-none">
            Результаты выполнения
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Печать
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Скачать PDF
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {resultType === "text" && order.resultText && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Текстовый результат
            </div>
            <div className="rounded-lg border bg-muted/50 p-6">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {order.resultText}
              </p>
            </div>
          </div>
        )}

        {resultType === "analysis" && analysisData && (
          <AnalysisResultView
            data={analysisData}
            patientGender={order.patient.gender}
            patientAge={patientAge}
          />
        )}

        {resultType === "protocol" && protocolData && (
          <ProtocolResultView data={protocolData} />
        )}

        {order.resultFileUrl && (
          <>
            {(resultType || order.resultText) && <Separator />}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-3">
                Файл результата
              </div>
              <Button asChild variant="outline" className="gap-2">
                <a
                  href={order.resultFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  Открыть файл
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

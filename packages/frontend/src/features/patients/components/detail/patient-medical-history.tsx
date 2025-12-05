"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Calendar,
  User,
  AlertTriangle,
  Pill,
  Activity,
  TrendingUp,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Bot,
  ClipboardList,
} from "lucide-react";
import { formatDate } from "@/lib/date.utils";
import { useGetPatientHistoryQuery } from "../../patient.api";
import type {
  HistoryVisitDto,
  PatientParameterHistoryDto,
  VisitStatusDto,
} from "../../patient.dto";

type PatientMedicalHistoryProps = {
  patientId: string;
};

// Helper functions
const getVisitStatusVariant = (status: VisitStatusDto) => {
  switch (status) {
    case "COMPLETED":
      return "secondary" as const;
    case "IN_PROGRESS":
      return "default" as const;
    case "WAITING":
      return "outline" as const;
    case "CANCELED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const getVisitStatusLabel = (status: VisitStatusDto) => {
  switch (status) {
    case "COMPLETED":
      return "Завершён";
    case "IN_PROGRESS":
      return "В процессе";
    case "WAITING":
      return "Ожидание";
    case "CANCELED":
      return "Отменён";
    default:
      return status;
  }
};

const getSeverityVariant = (severity?: string) => {
  switch (severity) {
    case "HIGH":
    case "SEVERE":
      return "destructive" as const;
    case "MEDIUM":
    case "MODERATE":
      return "default" as const;
    case "LOW":
    case "MILD":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const getSeverityLabel = (severity?: string) => {
  switch (severity) {
    case "HIGH":
    case "SEVERE":
      return "Тяжёлая";
    case "MEDIUM":
    case "MODERATE":
      return "Умеренная";
    case "LOW":
    case "MILD":
      return "Лёгкая";
    default:
      return severity;
  }
};

// Parameter labels and colors
const PARAMETER_CONFIG: Record<
  string,
  { label: string; color: string; unit?: string }
> = {
  BP_SYS: {
    label: "АД (сист.)",
    color: "var(--chart-1)",
    unit: "мм рт.ст.",
  },
  BP_DIA: {
    label: "АД (диаст.)",
    color: "var(--chart-2)",
    unit: "мм рт.ст.",
  },
  PULSE: { label: "Пульс", color: "var(--chart-3)", unit: "уд/мин" },
  TEMP: { label: "Температура", color: "var(--chart-4)", unit: "°C" },
  WEIGHT: { label: "Вес", color: "var(--chart-5)", unit: "кг" },
  HEIGHT: { label: "Рост", color: "hsl(200, 70%, 50%)", unit: "см" },
  HGB: { label: "Гемоглобин", color: "hsl(0, 70%, 50%)", unit: "г/л" },
  RBC: { label: "Эритроциты", color: "hsl(30, 70%, 50%)", unit: "x10^12/л" },
  WBC: { label: "Лейкоциты", color: "hsl(60, 70%, 50%)", unit: "x10^9/л" },
  PLT: { label: "Тромбоциты", color: "hsl(270, 70%, 50%)", unit: "x10^9/л" },
  ESR: { label: "СОЭ", color: "hsl(300, 70%, 50%)", unit: "мм/ч" },
};

const getChartConfig = (visibleParams: string[]): ChartConfig => {
  const config: ChartConfig = {};
  for (const code of visibleParams) {
    const paramConfig = PARAMETER_CONFIG[code];
    if (paramConfig) {
      config[code] = {
        label: paramConfig.label,
        color: paramConfig.color,
      };
    }
  }
  return config;
};

// Group parameters by code for charting
const groupParametersByCode = (parameters: PatientParameterHistoryDto[]) => {
  const grouped: Record<string, PatientParameterHistoryDto[]> = {};

  for (const param of parameters) {
    if (!grouped[param.parameterCode]) {
      grouped[param.parameterCode] = [];
    }
    grouped[param.parameterCode].push(param);
  }

  // Sort each group by date (oldest first for chart)
  for (const code of Object.keys(grouped)) {
    grouped[code].sort(
      (a, b) =>
        new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );
  }

  return grouped;
};

// Visit Card Component
const VisitCard = ({ visit }: { visit: HistoryVisitDto }) => {
  const [isOpen, setIsOpen] = useState(false);

  const doctorName = [
    visit.doctor.lastName,
    visit.doctor.firstName,
    visit.doctor.middleName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getVisitStatusVariant(visit.status)}>
                    {getVisitStatusLabel(visit.status)}
                  </Badge>
                  {visit.diagnosis && (
                    <Badge variant="outline" className="text-xs">
                      {visit.diagnosis}
                    </Badge>
                  )}
                </div>

                {visit.complaint && (
                  <p className="text-sm mb-2">
                    <span className="font-medium">Жалобы:</span>{" "}
                    {visit.complaint}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(visit.visitDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {doctorName}
                    {visit.doctor.specialty && ` (${visit.doctor.specialty})`}
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-4 space-y-4 bg-muted/30">
            {/* Anamnesis */}
            {visit.anamnesis && (
              <div>
                <h5 className="text-sm font-medium mb-1">Анамнез</h5>
                <p className="text-sm text-muted-foreground">
                  {visit.anamnesis}
                </p>
              </div>
            )}

            {/* Diagnosis */}
            {visit.diagnosis && (
              <div>
                <h5 className="text-sm font-medium mb-1">Диагноз</h5>
                <p className="text-sm">{visit.diagnosis}</p>
              </div>
            )}

            {/* Conclusion */}
            {visit.conclusion && (
              <div>
                <h5 className="text-sm font-medium mb-1">Заключение</h5>
                <p className="text-sm text-muted-foreground">
                  {visit.conclusion}
                </p>
              </div>
            )}

            {/* AI Summary */}
            {visit.aiSummary && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  AI Резюме
                </h5>
                <p className="text-sm text-muted-foreground">
                  {visit.aiSummary}
                </p>
              </div>
            )}

            {/* Prescriptions */}
            {visit.prescriptions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Назначения ({visit.prescriptions.length})
                </h5>
                <div className="space-y-2">
                  {visit.prescriptions.map((p) => (
                    <div
                      key={p.id}
                      className="text-sm p-2 bg-background rounded border"
                    >
                      <span className="font-medium">{p.name}</span>
                      {p.dosage && <span className="ml-2">{p.dosage}</span>}
                      {p.frequency && (
                        <span className="ml-2 text-muted-foreground">
                          — {p.frequency}
                        </span>
                      )}
                      {p.duration && (
                        <span className="ml-2 text-muted-foreground">
                          ({p.duration})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Orders */}
            {visit.serviceOrders.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Направления ({visit.serviceOrders.length})
                </h5>
                <div className="space-y-2">
                  {visit.serviceOrders.map((so) => (
                    <div
                      key={so.id}
                      className="text-sm p-2 bg-background rounded border flex justify-between"
                    >
                      <span>{so.serviceName}</span>
                      <Badge variant="outline" className="text-xs">
                        {so.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {visit.notes && (
              <div>
                <h5 className="text-sm font-medium mb-1">Заметки</h5>
                <p className="text-sm text-muted-foreground">{visit.notes}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Combined Parameters Chart Component
const CombinedParametersChart = ({
  groupedParameters,
}: {
  groupedParameters: Record<string, PatientParameterHistoryDto[]>;
}) => {
  const availableParams = Object.keys(groupedParameters);
  const [visibleParams, setVisibleParams] = useState<string[]>(availableParams);

  // Merge all data into a single dataset by date
  const chartData = useMemo(() => {
    const dataByDate: Record<string, Record<string, number | string>> = {};

    for (const [code, params] of Object.entries(groupedParameters)) {
      for (const param of params) {
        const dateKey = formatDate(param.measuredAt, "dd.MM.yy");
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {
            date: dateKey,
            fullDate: formatDate(param.measuredAt),
          };
        }
        if (param.valueNumeric !== undefined) {
          dataByDate[dateKey][code] = param.valueNumeric;
        }
      }
    }

    return Object.values(dataByDate).sort((a, b) => {
      const dateA = a.fullDate as string;
      const dateB = b.fullDate as string;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [groupedParameters]);

  const toggleParam = (code: string) => {
    setVisibleParams((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const chartConfig = useMemo(
    () => getChartConfig(visibleParams),
    [visibleParams]
  );

  if (availableParams.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Динамика показателей
        </CardTitle>
        <CardDescription>
          Нажмите на показатель чтобы скрыть/показать
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle buttons */}
        <div className="flex flex-wrap gap-2">
          {availableParams.map((code) => {
            const config = PARAMETER_CONFIG[code];
            const isVisible = visibleParams.includes(code);
            return (
              <Button
                key={code}
                variant={isVisible ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                style={{
                  backgroundColor: isVisible ? config?.color : undefined,
                  borderColor: config?.color,
                }}
                onClick={() => toggleParam(code)}
              >
                {config?.label ?? code}
                {config?.unit && (
                  <span className="ml-1 opacity-70">({config.unit})</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Chart */}
        {visibleParams.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(value, payload) => {
                  return payload?.[0]?.payload?.fullDate ?? value;
                }}
              />
              {visibleParams.map((code) => {
                const config = PARAMETER_CONFIG[code];
                return (
                  <Line
                    key={code}
                    type="monotone"
                    dataKey={code}
                    name={config?.label ?? code}
                    stroke={config?.color ?? "hsl(var(--chart-1))"}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ChartContainer>
        )}

        {visibleParams.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Выберите показатели для отображения</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function PatientMedicalHistory({
  patientId,
}: PatientMedicalHistoryProps) {
  const { data, isLoading, error } = useGetPatientHistoryQuery({
    id: patientId,
  });
  const [showAllVisits, setShowAllVisits] = useState(false);

  // Group parameters for charts
  const groupedParameters = useMemo(() => {
    if (!data?.parameters) return {};
    return groupParametersByCode(
      data.parameters.filter((p) => p.valueNumeric !== undefined)
    );
  }, [data?.parameters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Не удалось загрузить историю пациента</p>
      </div>
    );
  }

  const { visits, allergies, diagnoses, activeMedications, stats } = data;
  const visitsToShow = showAllVisits ? visits : visits.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Медицинская карта</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.lastVisitDate
            ? `Последний визит: ${formatDate(stats.lastVisitDate)}`
            : "Нет визитов"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Визитов</p>
                <p className="text-2xl font-bold">{stats.totalVisits}</p>
                <p className="text-xs text-green-600">
                  {stats.completedVisits} завершено
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Диагнозов</p>
                <p className="text-2xl font-bold">{stats.totalDiagnoses}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Препаратов</p>
                <p className="text-2xl font-bold">{stats.activeMedications}</p>
                <p className="text-xs text-muted-foreground">активных</p>
              </div>
              <Pill className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Аллергий</p>
                <p className="text-2xl font-bold">{stats.totalAllergies}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Info: Allergies, Medications, Diagnoses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Allergies */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Аллергии
              <Badge variant="destructive" className="ml-auto">
                {allergies.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allergies.length > 0 ? (
              allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="p-2 bg-red-50 dark:bg-red-950/20 rounded border-l-4 border-red-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {allergy.substance}
                    </span>
                    {allergy.severity && (
                      <Badge
                        variant={getSeverityVariant(allergy.severity)}
                        className="text-xs"
                      >
                        {getSeverityLabel(allergy.severity)}
                      </Badge>
                    )}
                  </div>
                  {allergy.reaction && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {allergy.reaction}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет известных аллергий
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Medications */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Pill className="h-4 w-4" />
              Препараты
              <Badge variant="outline" className="ml-auto">
                {activeMedications.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              За последние 30 дней
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeMedications.length > 0 ? (
              activeMedications.slice(0, 5).map((med) => (
                <div
                  key={med.id}
                  className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-4 border-blue-500"
                >
                  <div className="font-medium text-sm">{med.name}</div>
                  {med.dosage && (
                    <p className="text-xs text-muted-foreground">
                      {med.dosage} {med.frequency && `— ${med.frequency}`}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет активных назначений
              </p>
            )}
          </CardContent>
        </Card>

        {/* Diagnoses */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
              <Activity className="h-4 w-4" />
              Диагнозы
              <Badge variant="secondary" className="ml-auto">
                {diagnoses.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnoses.length > 0 ? (
              diagnoses.slice(0, 5).map((d, i) => (
                <div
                  key={`${d.visitId}-${i}`}
                  className="p-2 bg-green-50 dark:bg-green-950/20 rounded border-l-4 border-green-500"
                >
                  <div className="font-medium text-sm">{d.diagnosis}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(d.visitDate)} — {d.doctorName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет диагнозов
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Parameter Charts */}
      {Object.keys(groupedParameters).length > 0 && (
        <CombinedParametersChart groupedParameters={groupedParameters} />
      )}

      {/* Visit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            История визитов ({visits.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visitsToShow.length > 0 ? (
            <>
              {visitsToShow.map((visit) => (
                <VisitCard key={visit.id} visit={visit} />
              ))}

              {visits.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAllVisits(!showAllVisits)}
                >
                  {showAllVisits
                    ? "Скрыть"
                    : `Показать ещё ${visits.length - 5} визитов`}
                  {showAllVisits ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет визитов</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

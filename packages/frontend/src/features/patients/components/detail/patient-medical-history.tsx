"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Plus, 
  Calendar, 
  User,
  AlertTriangle,
  Heart,
  Pill,
  Activity
} from "lucide-react";

interface MedicalRecord {
  id: string;
  date: string;
  type: "DIAGNOSIS" | "TREATMENT" | "ALLERGY" | "MEDICATION" | "NOTE";
  title: string;
  description: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
  severity?: "LOW" | "MEDIUM" | "HIGH";
}

interface PatientMedicalHistoryProps {
  patientId: string;
}

// Mock data - в реальном приложении это будет загружаться через API
const mockMedicalHistory: MedicalRecord[] = [
  {
    id: "1",
    date: "2024-01-15",
    type: "DIAGNOSIS",
    title: "Гипертония I степени",
    description: "Артериальное давление 150/90 мм рт.ст. Рекомендованы регулярные измерения и коррекция образа жизни.",
    doctor: {
      firstName: "Иван",
      lastName: "Петров",
    },
    severity: "MEDIUM",
  },
  {
    id: "2",
    date: "2024-01-15",
    type: "MEDICATION",
    title: "Эналаприл 10 мг",
    description: "По 1 таблетке 2 раза в день утром и вечером. Контроль АД через 2 недели.",
    doctor: {
      firstName: "Иван",
      lastName: "Петров",
    },
  },
  {
    id: "3",
    date: "2024-01-08",
    type: "ALLERGY",
    title: "Аллергия на пенициллин",
    description: "Кожная сыпь, зуд. Избегать препаратов пенициллинового ряда.",
    doctor: {
      firstName: "Мария",
      lastName: "Сидорова",
    },
    severity: "HIGH",
  },
  {
    id: "4",
    date: "2024-01-08",
    type: "TREATMENT",
    title: "ЭКГ обследование",
    description: "ЭКГ в норме. Ритм синусовый, ЧСС 72 уд/мин. Патологических изменений не выявлено.",
    doctor: {
      firstName: "Мария",
      lastName: "Сидорова",
    },
  },
  {
    id: "5",
    date: "2023-12-20",
    type: "NOTE",
    title: "Профилактический осмотр",
    description: "Общее состояние удовлетворительное. Жалоб нет. Рекомендован контроль через 6 месяцев.",
    doctor: {
      firstName: "Иван",
      lastName: "Петров",
    },
  },
];

export function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "DIAGNOSIS":
        return <Activity className="h-4 w-4" />;
      case "TREATMENT":
        return <Heart className="h-4 w-4" />;
      case "ALLERGY":
        return <AlertTriangle className="h-4 w-4" />;
      case "MEDICATION":
        return <Pill className="h-4 w-4" />;
      case "NOTE":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case "DIAGNOSIS":
        return "Диагноз";
      case "TREATMENT":
        return "Лечение";
      case "ALLERGY":
        return "Аллергия";
      case "MEDICATION":
        return "Препарат";
      case "NOTE":
        return "Заметка";
      default:
        return type;
    }
  };

  const getRecordTypeVariant = (type: string) => {
    switch (type) {
      case "DIAGNOSIS":
        return "default" as const;
      case "TREATMENT":
        return "secondary" as const;
      case "ALLERGY":
        return "destructive" as const;
      case "MEDICATION":
        return "outline" as const;
      case "NOTE":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getSeverityVariant = (severity?: string) => {
    switch (severity) {
      case "HIGH":
        return "destructive" as const;
      case "MEDIUM":
        return "default" as const;
      case "LOW":
        return "secondary" as const;
      default:
        return undefined;
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case "HIGH":
        return "Высокая";
      case "MEDIUM":
        return "Средняя";
      case "LOW":
        return "Низкая";
      default:
        return undefined;
    }
  };

  // Группируем записи по типу для быстрого доступа
  const allergies = mockMedicalHistory.filter(record => record.type === "ALLERGY");
  const medications = mockMedicalHistory.filter(record => record.type === "MEDICATION");
  const diagnoses = mockMedicalHistory.filter(record => record.type === "DIAGNOSIS");

  // Сортируем по дате (новые сверху)
  const sortedHistory = [...mockMedicalHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Медицинская история</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить запись
        </Button>
      </div>

      {/* Важная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Аллергии */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Аллергии
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allergies.length > 0 ? (
              allergies.map((allergy) => (
                <div key={allergy.id} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                  <div className="font-medium text-sm">{allergy.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {allergy.description}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Нет известных аллергий</div>
            )}
          </CardContent>
        </Card>

        {/* Текущие препараты */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Препараты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {medications.length > 0 ? (
              medications.map((medication) => (
                <div key={medication.id} className="p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-medium text-sm">{medication.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {medication.description}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Нет назначенных препаратов</div>
            )}
          </CardContent>
        </Card>

        {/* Диагнозы */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Диагнозы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnoses.length > 0 ? (
              diagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                  <div className="font-medium text-sm">{diagnosis.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(diagnosis.date).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Нет установленных диагнозов</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Полная история */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Хронология записей ({sortedHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length > 0 ? (
            <div className="space-y-4">
              {sortedHistory.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getRecordTypeIcon(record.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getRecordTypeVariant(record.type)}>
                            {getRecordTypeLabel(record.type)}
                          </Badge>
                          {record.severity && (
                            <Badge variant={getSeverityVariant(record.severity)}>
                              {getSeverityLabel(record.severity)}
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium mb-1">{record.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {record.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.date).toLocaleDateString("ru-RU")}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {record.doctor.firstName} {record.doctor.lastName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет медицинских записей</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

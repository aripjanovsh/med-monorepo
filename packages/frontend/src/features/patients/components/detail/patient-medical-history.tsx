"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Plus, 
  Calendar, 
  User,
  AlertTriangle,
  Heart,
  Pill,
  Activity,
  Clock,
  TrendingUp,
  Shield,
  Stethoscope,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { formatDate } from "@/lib/date.utils";

interface MedicalRecord {
  id: string;
  date: string;
  type: "DIAGNOSIS" | "TREATMENT" | "ALLERGY" | "MEDICATION" | "NOTE" | "TEST" | "VACCINATION";
  title: string;
  description: string;
  doctor: {
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  severity?: "LOW" | "MEDIUM" | "HIGH";
  status?: "ACTIVE" | "COMPLETED" | "CANCELLED";
  attachments?: number;
}

interface PatientMedicalHistoryProps {
  patientId: string;
}

// Расширенные mock данные для демонстрации
const mockMedicalHistory: MedicalRecord[] = [
  {
    id: "1",
    date: "2024-06-28",
    type: "DIAGNOSIS",
    title: "Гипертония I степени",
    description: "Артериальное давление 150/90 мм рт.ст. Рекомендованы регулярные измерения и коррекция образа жизни. Назначена диета с ограничением соли.",
    doctor: {
      firstName: "Иван",
      lastName: "Петров",
      specialty: "Кардиолог"
    },
    severity: "MEDIUM",
    status: "ACTIVE",
    attachments: 2
  },
  {
    id: "2",
    date: "2024-06-28",
    type: "MEDICATION",
    title: "Эналаприл 10 мг",
    description: "По 1 таблетке 2 раза в день утром и вечером. Контроль АД через 2 недели. Избегать одновременного приема с калийсберегающими диуретиками.",
    doctor: {
      firstName: "Иван",
      lastName: "Петров",
      specialty: "Кардиолог"
    },
    status: "ACTIVE",
    attachments: 1
  },
  {
    id: "3",
    date: "2024-06-15",
    type: "ALLERGY",
    title: "Аллергия на пенициллин",
    description: "Кожная сыпь, зуд. Избегать препаратов пенициллинового ряда. В медицинской карте отмечена красным цветом.",
    doctor: {
      firstName: "Мария",
      lastName: "Сидорова",
      specialty: "Аллерголог"
    },
    severity: "HIGH",
    status: "ACTIVE",
    attachments: 1
  },
  {
    id: "4",
    date: "2024-06-15",
    type: "TEST",
    title: "ЭКГ обследование",
    description: "ЭКГ в норме. Ритм синусовый, ЧСС 72 уд/мин. Патологических изменений не выявлено. Сегмент ST без изменений.",
    doctor: {
      firstName: "Мария",
      lastName: "Сидорова",
      specialty: "Кардиолог"
    },
    status: "COMPLETED",
    attachments: 3
  },
  {
    id: "5",
    date: "2024-06-10",
    type: "TREATMENT",
    title: "Физиотерапия: магнитотерапия",
    description: "Курс 10 процедур. Назначено для улучшения кровообращения и снижения давления. Процедуры проводятся 2 раза в неделю.",
    doctor: {
      firstName: "Елена",
      lastName: "Козлова",
      specialty: "Физиотерапевт"
    },
    status: "COMPLETED",
    attachments: 0
  },
  {
    id: "6",
    date: "2024-06-01",
    type: "VACCINATION",
    title: "Гриппол Quadrivalent",
    description: "Вакцинация против гриппа. Переносимость хорошая, побочных реакций нет. Следующая вакцинация через 12 месяцев.",
    doctor: {
      firstName: "Анна",
      lastName: "Новикова",
      specialty: "Терапевт"
    },
    status: "COMPLETED",
    attachments: 1
  },
  {
    id: "7",
    date: "2024-05-20",
    type: "NOTE",
    title: "Профилактический осмотр",
    description: "Общее состояние удовлетворительное. Жалоб нет. Рекомендован контроль через 6 месяцев. Продолжать прием эналаприла.",
    doctor: {
      firstName: "Иван",
      lastName: "Петров",
      specialty: "Кардиолог"
    },
    attachments: 0
  },
  {
    id: "8",
    date: "2024-05-15",
    type: "TEST",
    title: "Общий анализ крови",
    description: "Гемоглобин 145 г/л, эритроциты 4.5 млн/мкл, лейкоциты 6.2 тыс/мкл. Показатели в пределах нормы.",
    doctor: {
      firstName: "Ольга",
      lastName: "Морозова",
      specialty: "Лаборант"
    },
    status: "COMPLETED",
    attachments: 2
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
      case "TEST":
        return <Shield className="h-4 w-4" />;
      case "VACCINATION":
        return <Shield className="h-4 w-4" />;
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
      case "TEST":
        return "Анализ";
      case "VACCINATION":
        return "Вакцина";
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
      case "TEST":
        return "secondary" as const;
      case "VACCINATION":
        return "default" as const;
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

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "default" as const;
      case "COMPLETED":
        return "secondary" as const;
      case "CANCELLED":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "Активно";
      case "COMPLETED":
        return "Завершено";
      case "CANCELLED":
        return "Отменено";
      default:
        return status;
    }
  };

  // Группируем записи по типу для быстрого доступа
  const allergies = mockMedicalHistory.filter(record => record.type === "ALLERGY");
  const medications = mockMedicalHistory.filter(record => record.type === "MEDICATION" && record.status === "ACTIVE");
  const diagnoses = mockMedicalHistory.filter(record => record.type === "DIAGNOSIS" && record.status === "ACTIVE");
  const recentTests = mockMedicalHistory.filter(record => record.type === "TEST").slice(0, 3);

  // Сортируем по дате (новые сверху)
  const sortedHistory = [...mockMedicalHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Статистика
  const stats = {
    total: mockMedicalHistory.length,
    active: mockMedicalHistory.filter(r => r.status === "ACTIVE").length,
    highSeverity: mockMedicalHistory.filter(r => r.severity === "HIGH").length,
    lastUpdate: sortedHistory[0]?.date || null,
    attachments: mockMedicalHistory.reduce((sum, r) => sum + (r.attachments || 0), 0)
  };

  const getDaysSinceLastUpdate = () => {
    if (!stats.lastUpdate) return null;
    const days = Math.floor((Date.now() - new Date(stats.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Медицинская карта</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Последнее обновление: {stats.lastUpdate ? formatDate(stats.lastUpdate) : 'Нет данных'}
            {getDaysSinceLastUpdate() !== null && (
              <span className="ml-2">
                ({getDaysSinceLastUpdate()} {getDaysSinceLastUpdate() === 1 ? 'день' : 
                   getDaysSinceLastUpdate()! < 5 ? 'дня' : 'дней'} назад)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Фильтр
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Добавить запись
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего записей</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.active} активных
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активные диагнозы</p>
                <p className="text-2xl font-bold">{diagnoses.length}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.highSeverity} высокой важности
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Текущие препараты</p>
                <p className="text-2xl font-bold">{medications.length}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {allergies.length} аллергий
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Вложения</p>
                <p className="text-2xl font-bold">{stats.attachments}</p>
                <p className="text-xs text-purple-600 mt-1">
                  Документы и анализы
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Критически важная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Аллергии - всегда на первом месте */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Аллергии
              <Badge variant="destructive" className="ml-auto">
                {allergies.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Критически важная информация
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {allergies.length > 0 ? (
              allergies.map((allergy) => (
                <div key={allergy.id} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{allergy.title}</div>
                    {allergy.attachments && (
                      <Badge variant="outline" className="text-xs">
                        {allergy.attachments} файл
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {allergy.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {allergy.doctor.firstName} {allergy.doctor.lastName}
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    {formatDate(allergy.date)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Нет известных аллергий
              </div>
            )}
          </CardContent>
        </Card>

        {/* Текущие препараты */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Pill className="h-5 w-5" />
              Препараты
              <Badge variant="outline" className="ml-auto">
                {medications.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Активные назначения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {medications.length > 0 ? (
              medications.map((medication) => (
                <div key={medication.id} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{medication.title}</div>
                    {medication.attachments && (
                      <Badge variant="outline" className="text-xs">
                        {medication.attachments} файл
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {medication.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {medication.doctor.firstName} {medication.doctor.lastName}
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    {formatDate(medication.date)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Нет назначенных препаратов
              </div>
            )}
          </CardContent>
        </Card>

        {/* Активные диагнозы */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
              <Activity className="h-5 w-5" />
              Диагнозы
              <Badge variant="secondary" className="ml-auto">
                {diagnoses.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Текущие состояния
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnoses.length > 0 ? (
              diagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{diagnosis.title}</div>
                    <div className="flex gap-1">
                      {diagnosis.severity && (
                        <Badge variant={getSeverityVariant(diagnosis.severity)} className="text-xs">
                          {getSeverityLabel(diagnosis.severity)}
                        </Badge>
                      )}
                      {diagnosis.attachments && (
                        <Badge variant="outline" className="text-xs">
                          {diagnosis.attachments}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {diagnosis.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Stethoscope className="h-3 w-3" />
                    {diagnosis.doctor.specialty}
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    {formatDate(diagnosis.date)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Нет установленных диагнозов
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Последние анализы и исследования */}
      {recentTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Последние анализы и исследования
            </CardTitle>
            <CardDescription>
              Результаты обследований за последний месяц
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentTests.map((test) => (
                <div key={test.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{test.title}</div>
                    <Badge variant={getStatusVariant(test.status)} className="text-xs">
                      {getStatusLabel(test.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {test.description}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {test.doctor.firstName} {test.doctor.lastName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(test.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Полная история */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Хронология записей ({sortedHistory.length})
            </CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Показать все
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedHistory.length > 0 ? (
            <div className="space-y-4">
              {sortedHistory.slice(0, 10).map((record) => (
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
                            <Badge variant={getSeverityVariant(record.severity)} className="text-xs">
                              {getSeverityLabel(record.severity)}
                            </Badge>
                          )}
                          {record.status && (
                            <Badge variant={getStatusVariant(record.status)} className="text-xs">
                              {getStatusLabel(record.status)}
                            </Badge>
                          )}
                          {record.attachments && record.attachments > 0 && (
                            <Badge variant="outline" className="text-xs">
                              📎 {record.attachments}
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
                            {formatDate(record.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {record.doctor.firstName} {record.doctor.lastName}
                          </div>
                          {record.doctor.specialty && (
                            <div className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {record.doctor.specialty}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {sortedHistory.length > 10 && (
                <div className="text-center">
                  <Button variant="outline" className="w-full">
                    Показать еще {sortedHistory.length - 10} записей
                    <TrendingUp className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
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

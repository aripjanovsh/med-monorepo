"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeResponseDto } from "@/features/employees/employee.dto";
import { WEEK_DAYS, WEEK_DAYS_LONG } from "../../employee.constants";

interface EmployeeProfileProps {
  employee: EmployeeResponseDto;
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const display =
    value === null || value === undefined || value === "" ? "-" : String(value);
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{display}</p>
    </div>
  );
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("ru-RU", {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
    : "-";

const formatDateOnly = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
    : "-";

const humanGender = (g?: EmployeeResponseDto["gender"]) =>
  g ? (g === "MALE" ? "Мужской" : "Женский") : "-";

export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  const createdAt = formatDate(employee.createdAt);
  const updatedAt = formatDate(employee.updatedAt);

  // Try to derive commonly expected fields if available
  const hrid = employee.employeeId || employee.id;
  const typeOfService = Array.isArray(employee.serviceTypes)
    ? (employee.serviceTypes as any[])
        .map((s) => (typeof s === "string" ? s : s?.name))
        .filter(Boolean)
        .join(", ") || "-"
    : "-";

  return (
    <div className="space-y-4">
      {/* Meta info row (creation/update dates) */}
      <div className="text-xs text-muted-foreground">
        <span className="mr-4">
          Дата создания: {createdAt} (
          <a href="#" className="text-primary">
            John Smith
          </a>
          )
        </span>
        <span className="mr-4">
          Дата обновления: {updatedAt} (
          <a href="#" className="text-primary">
            John Smith
          </a>
          )
        </span>
        <span className="mr-4">
          <a href="#" className="text-primary">
            История изменений
          </a>
        </span>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field label="Имя" value={employee.firstName} />
            <Field label="Фамилия" value={employee.lastName} />
            <Field label="Отчество" value={employee.middleName || "-"} />
            <Field label="Пол" value={humanGender(employee.gender)} />

            <Field label="Дата рождения" value={formatDateOnly(employee.dateOfBirth)} />
            <Field label="Email" value={employee.email || "-"} />
            <Field label="Должность" value={employee.title?.name || "-"} />
            <Field label="ID сотрудника" value={hrid} />

            <Field label="Дата приёма" value={formatDateOnly(employee.hireDate)} />
            <Field
              label="Дата увольнения"
              value={formatDateOnly(employee.terminationDate)}
            />
            <Field label="Типы услуг" value={typeOfService} />
            <Field
              label="Зарплата"
              value={
                employee.salary ? `$${employee.salary.toLocaleString()}` : "-"
              }
            />

            <Field label="Статус" value={employee.status || "-"} />
            <Field
              label="Основной язык"
              value={employee.primaryLanguage?.name || "-"}
            />
            <Field
              label="Второй язык"
              value={employee.secondaryLanguage?.name || "-"}
            />
            <div className="hidden lg:block" />
          </div>
        </CardContent>
      </Card>

      {/* Passport Information */}
      {(employee.passportSeries || employee.passportNumber || employee.passportIssuedBy) && (
        <Card>
          <CardHeader>
            <CardTitle>Паспортные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Field 
                label="Серия и номер паспорта" 
                value={
                  employee.passportSeries && employee.passportNumber
                    ? `${employee.passportSeries} ${employee.passportNumber}`
                    : "-"
                } 
              />
              <Field label="Кем выдан" value={employee.passportIssuedBy || "-"} />
              <Field 
                label="Дата выдачи" 
                value={formatDateOnly(employee.passportIssueDate)} 
              />
              <Field 
                label="Действителен до" 
                value={formatDateOnly(employee.passportExpiryDate)} 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field label="Основной телефон" value={employee.phone || "-"} />
            <Field
              label="Дополнительный телефон"
              value={employee.secondaryPhone || "-"}
            />
            <Field
              label="Рабочий телефон"
              value={employee.workPhone || "-"}
            />
            <div className="hidden lg:block" />

            <Field label="Страна" value={employee.country?.name || "-"} />
            <Field label="Регион" value={employee.region?.name || "-"} />
            <Field label="Город" value={employee.city?.name || "-"} />
            <Field label="Район" value={employee.district?.name || "-"} />

            <Field
              label="Адрес"
              value={employee.address || "-"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(employee.notes || employee.workSchedule) && (
        <Card>
          <CardHeader>
            <CardTitle>Дополнительная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {employee.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Заметки</p>
                <p className="text-sm">{employee.notes}</p>
              </div>
            )}

            {employee.workSchedule && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  График работы
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="min-w-0">
                      <Field
                        label={WEEK_DAYS_LONG[day]}
                        value={
                          employee.workSchedule?.[day]
                            ? `${employee.workSchedule[day].from} - ${employee.workSchedule[day].to}`
                            : "Не рабочий день"
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Field
                label="SMS-уведомления"
                value={
                  employee.textNotificationsEnabled === undefined
                    ? "-"
                    : employee.textNotificationsEnabled
                    ? "Включены"
                    : "Выключены"
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

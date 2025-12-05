"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProfileField } from "@/components/ui/profile-field";
import {
  formatEmployeeDateTime,
  formatEmployeeDate,
  getGenderDisplay,
  getEmployeeStatusDisplay,
  getPassportSeriesNumber,
  hasPassportInfo,
  getEmployeeDisplayId,
  getWorkScheduleForDay,
  getNotificationStatusDisplay,
  getEmployeeRoles,
} from "@/features/employees/employee.model";
import { EmployeeResponseDto } from "@/features/employees/employee.dto";
import { WEEK_DAYS, WEEK_DAYS_LONG } from "../../employee.constants";

type EmployeeProfileProps = {
  employee: EmployeeResponseDto;
};

export const EmployeeProfile = ({ employee }: EmployeeProfileProps) => {
  const fullName = `${employee.lastName} ${employee.firstName}`;

  return (
    <div className="space-y-4">
      {/* Meta info row (creation/update dates) */}
      <div className="text-xs text-muted-foreground">
        <span className="mr-4">
          Дата создания: {formatEmployeeDateTime(employee.createdAt)}
          {/* TODO: Add creator name when audit fields are implemented */}
        </span>
        <span className="mr-4">
          Дата обновления: {formatEmployeeDateTime(employee.updatedAt)}
          {/* TODO: Add updater name when audit fields are implemented */}
        </span>
        {/* TODO: Add history changes link when audit log is implemented */}
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfileField label="Имя" value={employee.firstName} />
            <ProfileField label="Фамилия" value={employee.lastName} />
            <ProfileField label="Отчество" value={employee.middleName} />
            <ProfileField
              label="Пол"
              value={getGenderDisplay(employee.gender)}
            />

            <ProfileField
              label="Дата рождения"
              value={formatEmployeeDate(employee.dateOfBirth)}
            />
            <ProfileField label="Email" value={employee.email} />
            <ProfileField label="Должность" value={employee.title?.name} />
            <ProfileField
              label="ID сотрудника"
              value={getEmployeeDisplayId(employee)}
            />

            <ProfileField
              label="Статус"
              value={getEmployeeStatusDisplay(employee.status)}
            />
            <ProfileField
              label="Основной язык"
              value={employee.primaryLanguage?.name}
            />
            <ProfileField
              label="Второй язык"
              value={employee.secondaryLanguage?.name}
            />
            <ProfileField label="Роли" value={getEmployeeRoles(employee)} />
            <div className="hidden lg:block" />
          </div>
        </CardContent>
      </Card>

      {/* Passport Information */}
      {hasPassportInfo(employee) && (
        <Card>
          <CardHeader>
            <CardTitle>Паспортные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProfileField
                label="Серия и номер паспорта"
                value={getPassportSeriesNumber(employee)}
              />
              <ProfileField
                label="Кем выдан"
                value={employee.passportIssuedBy}
              />
              <ProfileField
                label="Дата выдачи"
                value={formatEmployeeDate(employee.passportIssueDate)}
              />
              <ProfileField
                label="Действителен до"
                value={formatEmployeeDate(employee.passportExpiryDate)}
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
            <ProfileField label="Основной телефон" value={employee.phone} />
            <ProfileField
              label="Дополнительный телефон"
              value={employee.secondaryPhone}
            />
            <ProfileField label="Рабочий телефон" value={employee.workPhone} />
            <div className="hidden lg:block" />

            <ProfileField label="Страна" value={employee.country?.name} />
            <ProfileField label="Регион" value={employee.region?.name} />
            <ProfileField label="Город" value={employee.city?.name} />
            <ProfileField label="Район" value={employee.district?.name} />
            <ProfileField label="Адрес" value={employee.address} />
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
                      <ProfileField
                        label={WEEK_DAYS_LONG[day]}
                        value={getWorkScheduleForDay(employee, day)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <ProfileField
                label="SMS-уведомления"
                value={getNotificationStatusDisplay(
                  employee.textNotificationsEnabled
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileField } from "@/components/ui/profile-field";
import {
  formatPatientDateTime,
  formatPatientDate,
  getGenderDisplay,
  getPatientStatusDisplay,
  getAssignedDoctorsDisplay,
  getPassportSeriesNumber,
  hasPassportInfo,
  getPatientDisplayId,
  formatPatientLanguage,
} from "@/features/patients/patient.model";
import { PatientResponseDto } from "@/features/patients/patient.dto";

type PatientProfileProps = {
  patient: PatientResponseDto;
};

export const PatientProfile = ({ patient }: PatientProfileProps) => {
  return (
    <div className="space-y-4">
      {/* Meta info row (creation/update dates) */}
      <div className="text-xs text-muted-foreground">
        <span className="mr-4">
          Дата создания: {formatPatientDateTime(patient.createdAt)}
          {/* TODO: Add creator name when audit fields are implemented */}
        </span>
        <span className="mr-4">
          Дата обновления: {formatPatientDateTime(patient.updatedAt)}
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
            <ProfileField label="Имя" value={patient.firstName} />
            <ProfileField label="Фамилия" value={patient.lastName} />
            <ProfileField label="Отчество" value={patient.middleName} />
            <ProfileField
              label="Пол"
              value={getGenderDisplay(patient.gender)}
            />

            <ProfileField
              label="Дата рождения"
              value={formatPatientDate(patient.dateOfBirth)}
            />
            <ProfileField
              label="ID пациента"
              value={getPatientDisplayId(patient)}
            />
            <ProfileField
              label="Статус"
              value={getPatientStatusDisplay(patient.status)}
            />
            <ProfileField
              label="Последний визит"
              value={formatPatientDateTime(patient.lastVisitedAt)}
            />

            <ProfileField
              label="Основной язык"
              value={formatPatientLanguage(patient.primaryLanguage)}
            />
            <ProfileField
              label="Второй язык"
              value={formatPatientLanguage(patient.secondaryLanguage)}
            />
            <ProfileField
              label="Назначенные врачи"
              value={getAssignedDoctorsDisplay(patient)}
            />
            <div className="hidden lg:block" />
          </div>
        </CardContent>
      </Card>

      {/* Passport Information */}
      {hasPassportInfo(patient) && (
        <Card>
          <CardHeader>
            <CardTitle>Паспортные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProfileField
                label="Серия и номер паспорта"
                value={getPassportSeriesNumber(patient)}
              />
              <ProfileField
                label="Кем выдан"
                value={patient.passportIssuedBy}
              />
              <ProfileField
                label="Дата выдачи"
                value={formatPatientDate(patient.passportIssueDate)}
              />
              <ProfileField
                label="Действителен до"
                value={formatPatientDate(patient.passportExpiryDate)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Адрес проживания</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfileField label="Страна" value={patient.country?.name} />
            {patient.region && (
              <ProfileField label="Регион" value={patient.region?.name} />
            )}
            <ProfileField label="Город" value={patient.city?.name} />
            <ProfileField label="Район" value={patient.district?.name} />
            <ProfileField label="Адрес" value={patient.address} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      {(patient.phone || patient.secondaryPhone || patient.email) && (
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProfileField label="Основной телефон" value={patient.phone} />
              <ProfileField
                label="Дополнительный телефон"
                value={patient.secondaryPhone}
              />
              <ProfileField label="Email" value={patient.email} />
              <div className="hidden lg:block" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

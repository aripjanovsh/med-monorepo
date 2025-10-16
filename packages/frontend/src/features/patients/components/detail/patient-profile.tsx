"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientResponseDto } from "@/features/patients/patient.dto";

interface PatientProfileProps {
  patient: PatientResponseDto;
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

const humanGender = (g?: PatientResponseDto["gender"]) =>
  g ? (g === "MALE" ? "Мужской" : "Женский") : "-";

const humanStatus = (s?: PatientResponseDto["status"]) => {
  if (!s) return "-";
  const statusMap: Record<string, string> = {
    ACTIVE: "Активный",
    INACTIVE: "Неактивный",
    DECEASED: "Умерший",
  };
  return statusMap[s] || s;
};

export function PatientProfile({ patient }: PatientProfileProps) {
  const createdAt = formatDate(patient.createdAt);
  const updatedAt = formatDate(patient.updatedAt);

  // Get patient ID
  const patientDisplayId = patient.patientId || patient.id;

  // Get assigned doctors
  const assignedDoctors = patient.doctors
    ?.filter(d => d.isActive)
    .map(d => `${d.firstName} ${d.lastName}`)
    .join(", ") || "-";

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
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field label="Имя" value={patient.firstName} />
            <Field label="Фамилия" value={patient.lastName} />
            <Field label="Отчество" value={patient.middleName || "-"} />
            <Field label="Пол" value={humanGender(patient.gender)} />

            <Field label="Дата рождения" value={formatDateOnly(patient.dateOfBirth)} />
            <Field label="ID пациента" value={patientDisplayId} />
            <Field label="Статус" value={humanStatus(patient.status)} />
            <Field label="Последний визит" value={formatDate(patient.lastVisitedAt)} />

            <Field
              label="Основной язык"
              value={patient.primaryLanguage?.name || "-"}
            />
            <Field
              label="Второй язык"
              value={patient.secondaryLanguage?.name || "-"}
            />
            <Field label="Назначенные врачи" value={assignedDoctors} />
            <div className="hidden lg:block" />
          </div>
        </CardContent>
      </Card>

      {/* Passport Information */}
      {(patient.passportSeries || patient.passportNumber || patient.passportIssuedBy) && (
        <Card>
          <CardHeader>
            <CardTitle>Паспортные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Field 
                label="Серия и номер паспорта" 
                value={
                  patient.passportSeries && patient.passportNumber
                    ? `${patient.passportSeries} ${patient.passportNumber}`
                    : "-"
                } 
              />
              <Field label="Кем выдан" value={patient.passportIssuedBy || "-"} />
              <Field 
                label="Дата выдачи" 
                value={formatDateOnly(patient.passportIssueDate)} 
              />
              <Field 
                label="Действителен до" 
                value={formatDateOnly(patient.passportExpiryDate)} 
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
            <Field label="Страна" value={patient.country?.name || "-"} />
            <Field label="Регион" value={patient.region?.name || "-"} />
            <Field label="Город" value={patient.city?.name || "-"} />
            <Field label="Район" value={patient.district?.name || "-"} />

            <Field
              label="Адрес"
              value={patient.address || "-"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      {patient.contacts && patient.contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {patient.contacts.map((contact, index) => (
              <div key={contact.id || index}>
                <h4 className="text-sm font-semibold mb-4">
                  Контакт {index + 1} ({contact.type})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {contact.firstName && (
                    <>
                      <Field label="Имя контакта" value={contact.firstName} />
                      <Field label="Фамилия контакта" value={contact.lastName} />
                    </>
                  )}
                  <Field label="Основной телефон" value={contact.primaryPhone} />
                  <Field label="Дополнительный телефон" value={contact.secondaryPhone || "-"} />
                  
                  {contact.address && (
                    <>
                      <Field label="Адрес" value={contact.address} />
                      <Field label="Город" value={contact.city || "-"} />
                      <Field label="Страна" value={contact.country || "-"} />
                    </>
                  )}
                  
                  <Field
                    label="SMS-уведомления"
                    value={
                      contact.textNotificationsEnabled === undefined
                        ? "-"
                        : contact.textNotificationsEnabled
                        ? "Включены"
                        : "Выключены"
                    }
                  />
                  <Field
                    label="Email-уведомления"
                    value={
                      contact.emailNotificationsEnabled === undefined
                        ? "-"
                        : contact.emailNotificationsEnabled
                        ? "Включены"
                        : "Выключены"
                    }
                  />
                </div>
                {index < patient.contacts.length - 1 && (
                  <hr className="my-6 border-border" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

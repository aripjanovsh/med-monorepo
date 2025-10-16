"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Users, 
  Stethoscope,
  Globe,
  Languages
} from "lucide-react";

import { PatientResponseDto } from "../../patient.dto";
import {
  getPatientFullName,
  calculatePatientAge,
  getPatientDisplayStatus,
  getPatientPrimaryPhone,
  getPatientPrimaryContact,
  getPatientEmergencyContact,
  getContactDisplayName,
  getContactRelationDisplay,
  getContactTypeDisplay,
  formatPatientInfo,
  getPatientLastVisit,
  hasPatientVisited,
  getPatientPrimaryLanguage,
  getPatientSecondaryLanguage,
  getPatientLanguages,
  getPatientFullAddress,
  getPatientShortAddress,
} from "../../patient.model";

interface PatientOverviewProps {
  patient: PatientResponseDto;
}

export function PatientOverview({ patient }: PatientOverviewProps) {
  const fullName = getPatientFullName(patient);
  const age = calculatePatientAge(patient.dateOfBirth);
  const statusDisplay = getPatientDisplayStatus(patient.status);
  const primaryPhone = getPatientPrimaryPhone(patient);
  const primaryContact = getPatientPrimaryContact(patient);
  const emergencyContact = getPatientEmergencyContact(patient);
  const lastVisit = getPatientLastVisit(patient);
  const hasVisited = hasPatientVisited(patient);

  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default" as const;
      case "INACTIVE":
        return "secondary" as const;
      case "DECEASED":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Основная информация о пациенте */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{fullName}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{age} лет</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{patient.gender === 'MALE' ? 'Мужской' : 'Женский'}</span>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant={getStatusVariant(patient.status)}>
                  {statusDisplay}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">ID пациента:</span>
                <span>{patient.patientId || "Не указан"}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Дата рождения:</span>
                <span>{new Date(patient.dateOfBirth).toLocaleDateString("ru-RU")}</span>
              </div>
              
              {primaryPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Основной телефон:</span>
                  <span>{primaryPhone}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Последний визит:</span>
                <span className={!hasVisited ? "text-muted-foreground" : ""}>
                  {lastVisit}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Дата регистрации:</span>
                <span>{new Date(patient.createdAt).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Языки и Адрес */}
      {((patient.primaryLanguage?.name || patient.secondaryLanguage?.name) || 
        (patient.country?.name || patient.region?.name || patient.city?.name || patient.district?.name || patient.address)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Языки */}
          {(patient.primaryLanguage?.name || patient.secondaryLanguage?.name) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Языки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.primaryLanguage?.name && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Основной:</span>
                    <Badge variant="outline">{patient.primaryLanguage.name}</Badge>
                  </div>
                )}
                {patient.secondaryLanguage?.name && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Дополнительный:</span>
                    <Badge variant="outline">{patient.secondaryLanguage.name}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Адрес */}
          {(patient.country?.name || patient.region?.name || patient.city?.name || patient.district?.name || patient.address) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Адрес
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {getPatientFullAddress(patient)}
                  </div>
                  
                  {/* Детальная разбивка */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {patient.country?.name && (
                      <div>Страна: {patient.country.name}</div>
                    )}
                    {patient.region?.name && (
                      <div>Регион: {patient.region.name}</div>
                    )}
                    {patient.city?.name && (
                      <div>Город: {patient.city.name}</div>
                    )}
                    {patient.district?.name && (
                      <div>Район: {patient.district.name}</div>
                    )}
                    {patient.address && (
                      <div>Улица: {patient.address}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Контактная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Контактная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patient.contacts?.map((contact, index) => (
            <div key={contact.id || index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {getContactRelationDisplay(contact.relation)}
                </Badge>
                <Badge variant="secondary">
                  {getContactTypeDisplay(contact.type)}
                </Badge>
              </div>
              
              <div className="pl-4 space-y-1">
                {contact.relation !== "SELF" && (
                  <div>
                    <span className="font-medium">Имя: </span>
                    {getContactDisplayName(contact)}
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Основной телефон: </span>
                  {contact.primaryPhone}
                </div>
                
                {contact.secondaryPhone && (
                  <div>
                    <span className="font-medium">Дополнительный телефон: </span>
                    {contact.secondaryPhone}
                  </div>
                )}
                
                {contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div>{contact.address}</div>
                      {(contact.city || contact.country) && (
                        <div className="text-sm text-muted-foreground">
                          {[contact.city, contact.country].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>SMS: {contact.textNotificationsEnabled ? "✓" : "✗"}</span>
                  <span>Email: {contact.emailNotificationsEnabled ? "✓" : "✗"}</span>
                </div>
              </div>
              
              {index < patient.contacts.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Назначенные врачи */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Назначенные врачи
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.doctors?.length > 0 ? (
            <div className="space-y-3">
              {patient.doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {doctor.firstName[0]}{doctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {doctor.firstName} {doctor.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Назначен: {new Date(doctor.assignedAt).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  </div>
                  <Badge variant={doctor.isActive ? "default" : "secondary"}>
                    {doctor.isActive ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Врачи не назначены</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { EmployeeResponseDto } from "@/features/employees/employee.dto";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileField } from "@/components/ui/profile-field";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Languages,
  Award,
  DollarSign,
  Clock,
} from "lucide-react";
import { WEEK_DAYS, WEEK_DAYS_SHORT } from "../../employee.constants";
import {
  getEmployeeFullName,
  formatEmployeeDate,
  getGenderDisplay,
  getEmployeeStatusDisplay,
  formatSalary,
} from "../../employee.model";

interface EmployeeOverviewProps {
  employee: EmployeeResponseDto;
}

export function EmployeeOverview({ employee }: EmployeeOverviewProps) {
  const age = employee.dateOfBirth
    ? new Date().getFullYear() - new Date(employee.dateOfBirth).getFullYear()
    : null;

  const yearsOfService = employee.hireDate
    ? new Date().getFullYear() - new Date(employee.hireDate).getFullYear()
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Личная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ProfileField
              label="ФИО"
              value={getEmployeeFullName(employee)}
            />
            <ProfileField
              label="Дата рождения"
              value={formatEmployeeDate(employee.dateOfBirth)}
            />
            {age && (
              <ProfileField label="Возраст" value={`${age} лет`} />
            )}
            <ProfileField
              label="Пол"
              value={getGenderDisplay(employee.gender)}
            />
            <ProfileField label="ID сотрудника" value={employee.id} />
          </div>

          <Separator />

          <div className="space-y-3">
            <ProfileField
              label="Телефон"
              value={employee.phone}
              icon={Phone}
              variant="horizontal"
            />
            <ProfileField
              label="Email"
              value={employee.email}
              icon={Mail}
              variant="horizontal"
            />
            <ProfileField
              label="Адрес"
              value={employee.address}
              icon={MapPin}
              variant="horizontal"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Информация о работе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="Должность" value={employee.title.name} />
            <ProfileField label="Отдел" value="Не указан" />
            <div>
              <p className="text-xs text-muted-foreground">Тип занятости</p>
              <Badge variant="outline" className="mt-1">
                Полная занятость
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Статус</p>
              <Badge
                variant={employee.status === "ACTIVE" ? "default" : "secondary"}
                className={
                  employee.status === "ACTIVE"
                    ? "bg-green-100 text-green-800 mt-1"
                    : employee.status === "ON_LEAVE"
                    ? "bg-yellow-100 text-yellow-800 mt-1"
                    : "bg-red-100 text-red-800 mt-1"
                }
              >
                {getEmployeeStatusDisplay(employee.status)}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {employee.hireDate && (
              <ProfileField
                label="Дата найма"
                value={formatEmployeeDate(employee.hireDate)}
                icon={Calendar}
                variant="horizontal"
              />
            )}
            {yearsOfService && (
              <ProfileField
                label="Стаж работы"
                value={`${yearsOfService} лет`}
                icon={Clock}
                variant="horizontal"
              />
            )}
            {employee.salary && (
              <ProfileField
                label="Зарплата"
                value={formatSalary(employee.salary)}
                icon={DollarSign}
                variant="horizontal"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills and Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Навыки и языки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Языки
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Languages className="mr-1 h-3 w-3" />
                Английский
              </Badge>
              <Badge variant="outline">
                <Languages className="mr-1 h-3 w-3" />
                Русский
              </Badge>
              <Badge variant="outline">
                <Languages className="mr-1 h-3 w-3" />
                Узбекский
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Days */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Рабочее расписание</CardTitle>
          <CardDescription>
            Текущие рабочие дни и доступность
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {WEEK_DAYS?.map((day) => (
              <div key={day} className="text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    employee.workSchedule?.[day]
                      ? "bg-green-100 text-green-800 border-2 border-green-300"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {WEEK_DAYS_SHORT[day]}
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  {employee.workSchedule?.[day] ? "Работает" : "Выходной"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {/* {employee.achievements && employee.achievements.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employee.achievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {achievement.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}

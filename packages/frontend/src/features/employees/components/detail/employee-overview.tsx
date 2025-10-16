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
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  DollarSign,
  Clock,
} from "lucide-react";
import { WEEK_DAYS, WEEK_DAYS_SHORT } from "../../employee.constants";

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
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Full Name
              </p>
              <p className="text-sm">
                {employee.firstName} {employee.lastName}
              </p>
            </div>
            {employee.dateOfBirth && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </p>
                <p className="text-sm">
                  {new Date(employee.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            )}
            {age && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Age</p>
                <p className="text-sm">{age} years old</p>
              </div>
            )}
            {employee.gender && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Gender
                </p>
                <p className="text-sm">{employee.gender}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Employee ID
              </p>
              <p className="text-sm">{employee.id}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{employee.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{employee.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">San Francisco, CA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Employment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Position
              </p>
              <p className="text-sm">{employee.title.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Department
              </p>
              <p className="text-sm">{"Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Employment Type
              </p>
              <Badge variant="outline">Полная занятость</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                variant={employee.status === "ACTIVE" ? "default" : "secondary"}
                className={
                  employee.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : employee.status === "ON_LEAVE"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {employee.status}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {employee.hireDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Hired: {new Date(employee.hireDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {yearsOfService && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {yearsOfService} years of service
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">20 years of experience</span>
            </div>
            {employee.salary && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  ${employee.salary.toLocaleString()}/year
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills and Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Skills & Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {employee.skills && employee.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Languages
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Languages className="mr-1 h-3 w-3" />
                English
              </Badge>
              <Badge variant="outline">
                <Languages className="mr-1 h-3 w-3" />
                Russian
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Days */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Working Schedule</CardTitle>
          <CardDescription>
            Current working days and availability
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
                  {employee.workSchedule?.[day] ? "Available" : "Off"}
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

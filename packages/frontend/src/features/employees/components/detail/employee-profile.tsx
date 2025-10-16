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

const humanGender = (g?: EmployeeResponseDto["gender"]) =>
  g ? (g === "MALE" ? "Male" : "Female") : "-";

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
            <Field label="First Name" value={employee.firstName} />
            <Field label="Last Name" value={employee.lastName} />
            <Field label="Gender" value={humanGender(employee.gender)} />
            <Field label="Email" value={employee.email || "-"} />

            <Field label="Hire Date" value={formatDate(employee.hireDate)} />
            <Field
              label="End Work Date"
              value={formatDate(employee.terminationDate)}
            />
            <Field label="Title" value={employee.title?.name || "-"} />
            <Field label="HRID" value={hrid} />

            <Field label="Type of Service" value={typeOfService} />
            <Field label="Group" value={"-"} />
            <Field label="Supervisor" value={"-"} />
            <Field label="Profit center" value={"-"} />

            <Field label="Employee type" value={"-"} />
            <Field
              label="Salary"
              value={
                employee.salary ? `$${employee.salary.toLocaleString()}` : "-"
              }
            />
            <Field label="Status" value={employee.status || "-"} />
            <div className="hidden lg:block" />

            <Field
              label="Primary Language"
              value={employee.primaryLanguage?.name || "-"}
            />
            <Field
              label="Secondary Language"
              value={employee.secondaryLanguage?.name || "-"}
            />
            <Field label="Skills" value={"-"} />
            <div className="hidden lg:block" />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field label="Primary Phone Number" value={employee.phone || "-"} />
            <Field
              label="Secondary Phone Number"
              value={employee.secondaryPhone || "-"}
            />
            <Field
              label="Work Phone Number"
              value={employee.workPhone || "-"}
            />
            <div className="hidden lg:block" />

            <Field
              label="Address"
              value={
                [
                  employee.address,
                  employee.city?.name,
                  employee.region?.name,
                  employee.country?.name,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(employee.notes || employee.workSchedule) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {employee.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{employee.notes}</p>
              </div>
            )}

            {employee.workSchedule && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Work Schedule
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
                label="Enable Text Notifications"
                value={
                  employee.textNotificationsEnabled === undefined
                    ? "-"
                    : employee.textNotificationsEnabled
                    ? "Yes"
                    : "No"
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import {
  Calendar,
  Shield,
  AlertTriangle,
  Activity,
  User,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Clock,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Patient } from "@/types/patient";

interface PatientOverviewProps {
  patient: Patient;
}

export function PatientOverview({ patient }: PatientOverviewProps) {
  const age =
    new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
  const latestVitals = patient.vitalSigns?.[0]; // Assuming sorted by date desc

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Personal Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Full Name
              </p>
              <p className="text-base">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date of Birth
              </p>
              <p className="text-base">
                {new Date(patient.birthDate).toLocaleDateString()} ({age} years
                old)
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Gender
              </p>
              <p className="text-base">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Patient ID
              </p>
              <p className="text-base font-mono">{patient.id}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Address
            </p>
            <p className="text-base">{patient.address}</p>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Emergency Contact
            </h4>
            <div className="space-y-1">
              <p className="text-base">{patient.emergencyContact.name}</p>
              <p className="text-sm text-muted-foreground">
                {patient.emergencyContact.relationship}
              </p>
              <p className="text-sm">{patient.emergencyContact.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance & Latest Vitals */}
      <div className="space-y-6">
        {/* Insurance Information */}
        {patient.insurance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Insurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Provider
                </p>
                <p className="text-base">{patient.insurance.provider}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Policy Number
                </p>
                <p className="text-base font-mono">
                  {patient.insurance.policyNumber}
                </p>
              </div>
              {patient.insurance.groupNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Group Number
                  </p>
                  <p className="text-base font-mono">
                    {patient.insurance.groupNumber}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expires
                </p>
                <p className="text-base">
                  {new Date(patient.insurance.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Vital Signs */}
        {latestVitals && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Latest Vital Signs
              </CardTitle>
              <CardDescription>
                Recorded on {new Date(latestVitals.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestVitals.bloodPressureSystolic &&
                latestVitals.bloodPressureDiastolic && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm">Blood Pressure</span>
                    </div>
                    <span className="font-medium">
                      {latestVitals.bloodPressureSystolic}/
                      {latestVitals.bloodPressureDiastolic} mmHg
                    </span>
                  </div>
                )}

              {latestVitals.heartRate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">Heart Rate</span>
                  </div>
                  <span className="font-medium">
                    {latestVitals.heartRate} bpm
                  </span>
                </div>
              )}

              {latestVitals.temperature && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="font-medium">
                    {latestVitals.temperature}°F
                  </span>
                </div>
              )}

              {latestVitals.weight && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Weight className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">Weight</span>
                  </div>
                  <span className="font-medium">{latestVitals.weight} kg</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Allergies & Current Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allergies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="space-y-3">
                {patient.allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{allergy.allergen}</p>
                      <p className="text-sm text-muted-foreground">
                        {allergy.reaction}
                      </p>
                    </div>
                    <Badge
                      variant={
                        allergy.severity === "SEVERE"
                          ? "destructive"
                          : allergy.severity === "MODERATE"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {allergy.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No known allergies</p>
            )}
          </CardContent>
        </Card>

        {/* Current Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.medications &&
            patient.medications.filter((m) => m.status === "ACTIVE").length >
              0 ? (
              <div className="space-y-3">
                {patient.medications
                  .filter((m) => m.status === "ACTIVE")
                  .slice(0, 3) // Show only first 3
                  .map((medication) => (
                    <div key={medication.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{medication.name}</p>
                        <Badge variant="outline">{medication.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medication.dosage} • {medication.frequency}
                      </p>
                    </div>
                  ))}
                {patient.medications.filter((m) => m.status === "ACTIVE")
                  .length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +
                    {patient.medications.filter((m) => m.status === "ACTIVE")
                      .length - 3}{" "}
                    more medications
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No active medications</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Last visit */}
            {patient.lastVisit && (
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Calendar className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium">Last Visit</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(patient.lastVisit).toLocaleDateString()} with{" "}
                    {patient.assignedDoctor}
                  </p>
                </div>
              </div>
            )}

            {/* Latest test result */}
            {patient.testResults && patient.testResults.length > 0 && (
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <FileText className="h-4 w-4 mt-1 text-green-500" />
                <div>
                  <p className="font-medium">Latest Test Result</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.testResults[0].testName} -{" "}
                    {new Date(patient.testResults[0].date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Next appointment */}
            {patient.nextAppointment && (
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50">
                <Calendar className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium">Next Appointment</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(patient.nextAppointment).toLocaleDateString()}{" "}
                    with {patient.assignedDoctor}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

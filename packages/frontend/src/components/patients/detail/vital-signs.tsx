"use client";

import { useState } from "react";
import {
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Droplet,
  Wind,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Patient, VitalSign } from "@/types/patient";
import { VitalSignsChart } from "./charts/vital-signs-chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VitalSignsForm } from "../forms/vital-signs-form";

interface VitalSignsProps {
  patient: Patient;
}

export function VitalSigns({ patient }: VitalSignsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("3months");
  const [selectedVital, setSelectedVital] = useState<string>("bloodPressure");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVitalSign, setEditingVitalSign] = useState<
    VitalSign | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const sortedVitals =
    patient.vitalSigns?.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ) || [];

  const latestVitals = sortedVitals[0];

  // Simple trend calculation
  const getTrend = (
    current: number | undefined,
    previous: number | undefined,
  ) => {
    if (!current || !previous) return "stable";
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return "up";
    if (change < -5) return "down";
    return "stable";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVitalStatus = (value: number | undefined, type: string) => {
    if (!value) return "normal";

    switch (type) {
      case "bloodPressureSystolic":
        if (value > 140) return "high";
        if (value < 90) return "low";
        return "normal";
      case "bloodPressureDiastolic":
        if (value > 90) return "high";
        if (value < 60) return "low";
        return "normal";
      case "heartRate":
        if (value > 100) return "high";
        if (value < 60) return "low";
        return "normal";
      case "temperature":
        if (value > 100.4) return "high";
        if (value < 97.0) return "low";
        return "normal";
      default:
        return "normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "text-red-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-green-600";
    }
  };

  const handleRecordVitals = () => {
    setEditingVitalSign(undefined);
    setIsFormOpen(true);
  };

  const handleEditVitalSign = (vitalSign: VitalSign) => {
    setEditingVitalSign(vitalSign);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingVitalSign) {
        console.log("Updating vital signs:", {
          id: editingVitalSign.id,
          ...data,
        });
      } else {
        console.log("Recording vital signs:", {
          patientId: patient.id,
          ...data,
        });
      }

      setIsFormOpen(false);
      setEditingVitalSign(undefined);
      // In real app, you would refetch the patient data here
    } catch (error) {
      console.error("Error saving vital signs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingVitalSign(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vital Signs</h2>
          <p className="text-muted-foreground">
            Track and monitor patient&apos;s vital signs and health metrics
          </p>
        </div>
        <Button onClick={handleRecordVitals}>
          <Plus className="h-4 w-4 mr-2" />
          Record Vitals
        </Button>
      </div>

      {/* Latest Vital Signs Cards */}
      {latestVitals && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Latest Readings
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({new Date(latestVitals.date).toLocaleDateString()})
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blood Pressure */}
            {latestVitals.bloodPressureSystolic &&
              latestVitals.bloodPressureDiastolic && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      {sortedVitals[1] &&
                        getTrendIcon(
                          getTrend(
                            latestVitals.bloodPressureSystolic,
                            sortedVitals[1].bloodPressureSystolic,
                          ),
                        )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Blood Pressure
                    </p>
                    <p
                      className={`text-2xl font-bold ${getStatusColor(getVitalStatus(latestVitals.bloodPressureSystolic, "bloodPressureSystolic"))}`}
                    >
                      {latestVitals.bloodPressureSystolic}/
                      {latestVitals.bloodPressureDiastolic}
                    </p>
                    <p className="text-xs text-muted-foreground">mmHg</p>
                  </CardContent>
                </Card>
              )}

            {/* Heart Rate */}
            {latestVitals.heartRate && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    {sortedVitals[1] &&
                      getTrendIcon(
                        getTrend(
                          latestVitals.heartRate,
                          sortedVitals[1].heartRate,
                        ),
                      )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Heart Rate
                  </p>
                  <p
                    className={`text-2xl font-bold ${getStatusColor(getVitalStatus(latestVitals.heartRate, "heartRate"))}`}
                  >
                    {latestVitals.heartRate}
                  </p>
                  <p className="text-xs text-muted-foreground">bpm</p>
                </CardContent>
              </Card>
            )}

            {/* Temperature */}
            {latestVitals.temperature && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    {sortedVitals[1] &&
                      getTrendIcon(
                        getTrend(
                          latestVitals.temperature,
                          sortedVitals[1].temperature,
                        ),
                      )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Temperature
                  </p>
                  <p
                    className={`text-2xl font-bold ${getStatusColor(getVitalStatus(latestVitals.temperature, "temperature"))}`}
                  >
                    {latestVitals.temperature}
                  </p>
                  <p className="text-xs text-muted-foreground">°F</p>
                </CardContent>
              </Card>
            )}

            {/* Weight */}
            {latestVitals.weight && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Weight className="h-5 w-5 text-green-500" />
                    {sortedVitals[1] &&
                      getTrendIcon(
                        getTrend(latestVitals.weight, sortedVitals[1].weight),
                      )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Weight
                  </p>
                  <p className="text-2xl font-bold">{latestVitals.weight}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </CardContent>
              </Card>
            )}

            {/* Oxygen Saturation */}
            {latestVitals.oxygenSaturation && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Droplet className="h-5 w-5 text-cyan-500" />
                    {sortedVitals[1] &&
                      getTrendIcon(
                        getTrend(
                          latestVitals.oxygenSaturation,
                          sortedVitals[1].oxygenSaturation,
                        ),
                      )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Oxygen Saturation
                  </p>
                  <p className="text-2xl font-bold">
                    {latestVitals.oxygenSaturation}
                  </p>
                  <p className="text-xs text-muted-foreground">%</p>
                </CardContent>
              </Card>
            )}

            {/* Respiratory Rate */}
            {latestVitals.respiratoryRate && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Wind className="h-5 w-5 text-purple-500" />
                    {sortedVitals[1] &&
                      getTrendIcon(
                        getTrend(
                          latestVitals.respiratoryRate,
                          sortedVitals[1].respiratoryRate,
                        ),
                      )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Respiratory Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {latestVitals.respiratoryRate}
                  </p>
                  <p className="text-xs text-muted-foreground">breaths/min</p>
                </CardContent>
              </Card>
            )}

            {/* Height */}
            {latestVitals.height && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Ruler className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Height
                  </p>
                  <p className="text-2xl font-bold">{latestVitals.height}</p>
                  <p className="text-xs text-muted-foreground">cm</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs Trends</CardTitle>
          <CardDescription>Visualize vital signs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedVital} onValueChange={setSelectedVital}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select vital sign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                <SelectItem value="heartRate">Heart Rate</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="oxygenSaturation">
                  Oxygen Saturation
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">Last Week</SelectItem>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vital Signs Chart */}
          <VitalSignsChart
            vitalSigns={sortedVitals}
            selectedVital={selectedVital}
            period={selectedPeriod}
          />
        </CardContent>
      </Card>

      {/* Vital Signs History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs History</CardTitle>
          <CardDescription>
            Complete record of all vital sign measurements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedVitals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Blood Pressure</TableHead>
                  <TableHead>Heart Rate</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>O2 Sat</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVitals.map((vital) => (
                  <TableRow key={vital.id}>
                    <TableCell className="font-medium">
                      {new Date(vital.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {vital.bloodPressureSystolic &&
                      vital.bloodPressureDiastolic ? (
                        <span
                          className={getStatusColor(
                            getVitalStatus(
                              vital.bloodPressureSystolic,
                              "bloodPressureSystolic",
                            ),
                          )}
                        >
                          {vital.bloodPressureSystolic}/
                          {vital.bloodPressureDiastolic}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vital.heartRate ? (
                        <span
                          className={getStatusColor(
                            getVitalStatus(vital.heartRate, "heartRate"),
                          )}
                        >
                          {vital.heartRate} bpm
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vital.temperature ? (
                        <span
                          className={getStatusColor(
                            getVitalStatus(vital.temperature, "temperature"),
                          )}
                        >
                          {vital.temperature}°F
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vital.weight ? (
                        <span>{vital.weight} kg</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vital.oxygenSaturation ? (
                        <span>{vital.oxygenSaturation}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {vital.recordedBy}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No vital signs recorded
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by recording the first vital signs for this patient.
              </p>
              <div className="mt-6">
                <Button size="sm" onClick={handleRecordVitals}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Vital Signs
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Normal Ranges Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Normal Ranges Reference</CardTitle>
          <CardDescription>
            Standard vital sign reference ranges for adults
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium">Blood Pressure</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Normal: 90-140 / 60-90 mmHg
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Heart Rate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Normal: 60-100 bpm
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Temperature</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Normal: 97.0-100.4°F
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Droplet className="h-4 w-4 text-cyan-500" />
                <span className="font-medium">Oxygen Saturation</span>
              </div>
              <p className="text-sm text-muted-foreground">Normal: 95-100%</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wind className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Respiratory Rate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Normal: 12-20 breaths/min
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVitalSign ? "Edit Vital Signs" : "Record Vital Signs"}
            </DialogTitle>
          </DialogHeader>
          <VitalSignsForm
            vitalSign={editingVitalSign}
            patientId={patient.id}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

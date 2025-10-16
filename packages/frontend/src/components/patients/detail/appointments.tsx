"use client";

import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  MapPin, 
  User, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Patient, Appointment } from "@/types/patient";
import { AppointmentForm } from "../forms/appointment-form";

interface AppointmentsProps {
  patient: Patient;
}

export function Appointments({ patient }: AppointmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const filteredAppointments = patient.appointments
    ?.filter((appointment) => {
      const matchesSearch = appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
      const matchesType = filterType === "all" || appointment.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "NO_SHOW":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return <Clock className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      case "NO_SHOW":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Appointment["type"]) => {
    switch (type) {
      case "CONSULTATION":
        return "bg-blue-100 text-blue-800";
      case "FOLLOW_UP":
        return "bg-green-100 text-green-800";
      case "PROCEDURE":
        return "bg-purple-100 text-purple-800";
      case "SURGERY":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const upcomingAppointments = patient.appointments?.filter(
    a => a.status === "SCHEDULED" && new Date(a.date) >= new Date()
  ) || [];

  const pastAppointments = patient.appointments?.filter(
    a => a.status === "COMPLETED" || new Date(a.date) < new Date()
  ) || [];

  const handleScheduleAppointment = () => {
    setEditingAppointment(undefined);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingAppointment) {
        console.log("Updating appointment:", { id: editingAppointment.id, ...data });
      } else {
        console.log("Creating appointment:", { patientId: patient.id, ...data });
      }
      
      setIsFormOpen(false);
      setEditingAppointment(undefined);
      // In real app, you would refetch the patient data here
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingAppointment(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appointments</h2>
          <p className="text-muted-foreground">
            Scheduled visits, procedures, and appointment history
          </p>
        </div>
        <Button onClick={handleScheduleAppointment}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">
                  {patient.appointments?.filter(a => a.status === "COMPLETED").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold">
                  {patient.appointments?.filter(a => a.status === "CANCELLED").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">No Shows</p>
                <p className="text-2xl font-bold">
                  {patient.appointments?.filter(a => a.status === "NO_SHOW").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                <SelectItem value="PROCEDURE">Procedure</SelectItem>
                <SelectItem value="SURGERY">Surgery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                        <Badge className={getStatusColor(appointment.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(appointment.status)}
                            <span>{appointment.status}</span>
                          </span>
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold">{appointment.reason}</h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time} ({appointment.duration} min)
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {appointment.department}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
          <CardDescription>Complete history of all appointments and visits</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments && filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <div key={appointment.id} className="relative">
                  {/* Timeline connector */}
                  {index < filteredAppointments.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-border z-0"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 mt-2">
                      <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        appointment.status === "COMPLETED" ? "bg-green-500" :
                        appointment.status === "SCHEDULED" ? "bg-blue-500" :
                        appointment.status === "CANCELLED" ? "bg-red-500" : "bg-orange-500"
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getTypeColor(appointment.type)}>
                              {appointment.type}
                            </Badge>
                            <Badge className={getStatusColor(appointment.status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(appointment.status)}
                                <span>{appointment.status}</span>
                              </span>
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{appointment.reason}</h3>
                        </div>
                        
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {appointment.department}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.duration} minutes
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by scheduling the first appointment for this patient."
                }
              </p>
              {!searchTerm && filterStatus === "all" && filterType === "all" && (
                              <div className="mt-6">
                <Button size="sm" onClick={handleScheduleAppointment}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4" onClick={handleScheduleAppointment}>
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Schedule Follow-up</p>
                <p className="text-sm text-muted-foreground">Book next appointment</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Emergency Slot</p>
                <p className="text-sm text-muted-foreground">Book urgent appointment</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Specialist Referral</p>
                <p className="text-sm text-muted-foreground">Refer to specialist</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Edit Appointment" : "Schedule Appointment"}
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm
            appointment={editingAppointment}
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
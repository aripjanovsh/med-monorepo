"use client";

import { Employee } from "@/types/employee";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, User, Phone, Mail, Calendar, ExternalLink } from "lucide-react";

// Mock patient data for demonstration
const mockPatients = [
  {
    id: "1",
    name: "Emily Johnson",
    avatar: "/avatars/emily.jpg",
    phone: "555-0123",
    email: "emily.johnson@email.com",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-15",
    status: "ACTIVE" as const,
  },
  {
    id: "3",
    name: "Sarah Davis",
    avatar: "/avatars/sarah.jpg",
    phone: "555-0127",
    email: "sarah.davis@email.com",
    lastVisit: "2023-12-20",
    nextAppointment: "2024-02-05",
    status: "ACTIVE" as const,
  },
  {
    id: "5",
    name: "Robert Wilson",
    avatar: "/avatars/robert.jpg",
    phone: "555-0129",
    email: "robert.wilson@email.com",
    lastVisit: "2024-01-08",
    nextAppointment: null,
    status: "INACTIVE" as const,
  },
];

interface EmployeePatientsProps {
  employee: Employee;
}

export function EmployeePatients({ employee }: EmployeePatientsProps) {
  const assignedPatientIds = employee.patientsAssigned || [];
  
  // In a real app, this would fetch patient data based on IDs
  const assignedPatients = mockPatients.filter(patient => 
    assignedPatientIds.includes(patient.id)
  );

  const activePatients = assignedPatients.filter(patient => patient.status === "ACTIVE");
  const inactivePatients = assignedPatients.filter(patient => patient.status === "INACTIVE");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Patients</p>
                <p className="text-2xl font-bold">{assignedPatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Patients</p>
                <p className="text-2xl font-bold">{activePatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Upcoming Appointments</p>
                <p className="text-2xl font-bold">
                  {assignedPatients.filter(p => p.nextAppointment).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Patients */}
      {activePatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Active Patients
            </CardTitle>
            <CardDescription>
              Currently assigned and active patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePatients.map((patient) => (
                <div key={patient.id} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{patient.name}</h3>
                        <Badge variant="outline" className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {patient.email}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </div>
                        {patient.nextAppointment && (
                          <div className="flex items-center text-blue-600">
                            <Calendar className="mr-1 h-3 w-3" />
                            Next: {new Date(patient.nextAppointment).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Patients */}
      {inactivePatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Patients</CardTitle>
            <CardDescription>
              Previously assigned patients who are currently inactive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactivePatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Patients */}
      {assignedPatients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Assigned</h3>
            <p className="text-sm text-gray-500">
              This employee has no patients currently assigned to them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { 
  Pill, 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Edit,
  Trash2,
  Shield
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Patient, Medication } from "@/types/patient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MedicationForm } from "../forms/medication-form";

interface MedicationsProps {
  patient: Patient;
}

export function Medications({ patient }: MedicationsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const filteredMedications = patient.medications
    ?.filter((medication) => {
      const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medication.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || medication.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort by status priority: ACTIVE > DISCONTINUED > COMPLETED
      const statusPriority = { ACTIVE: 3, DISCONTINUED: 2, COMPLETED: 1 };
      return statusPriority[b.status] - statusPriority[a.status];
    });

  const getStatusColor = (status: Medication["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DISCONTINUED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Medication["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "DISCONTINUED":
        return <XCircle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const activeMedications = patient.medications?.filter(m => m.status === "ACTIVE") || [];
  const discontinuedMedications = patient.medications?.filter(m => m.status === "DISCONTINUED") || [];

  const handlePrescribeMedication = () => {
    setEditingMedication(undefined);
    setIsFormOpen(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingMedication) {
        console.log("Updating medication:", { id: editingMedication.id, ...data });
      } else {
        console.log("Prescribing medication:", { patientId: patient.id, ...data });
      }
      
      setIsFormOpen(false);
      setEditingMedication(undefined);
      // In real app, you would refetch the patient data here
    } catch (error) {
      console.error("Error saving medication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMedication(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medications</h2>
          <p className="text-muted-foreground">
            Current and past medications, prescriptions, and treatment plans
          </p>
        </div>
        <Button onClick={handlePrescribeMedication}>
          <Plus className="h-4 w-4 mr-2" />
          Prescribe Medication
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Medications</p>
                <p className="text-2xl font-bold">{activeMedications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Discontinued</p>
                <p className="text-2xl font-bold">{discontinuedMedications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Allergies</p>
                <p className="text-2xl font-bold">{patient.allergies?.length || 0}</p>
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
                  placeholder="Search medications..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active Medications - Highlighted */}
      {activeMedications.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Pill className="h-5 w-5 mr-2" />
              Active Medications
            </CardTitle>
            <CardDescription>Currently prescribed medications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMedications.map((medication) => (
                <div key={medication.id} className="p-4 bg-white border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{medication.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {medication.dosage} • {medication.frequency}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit Prescription</DropdownMenuItem>
                        <DropdownMenuItem>Discontinue</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Started:</span>{" "}
                      {new Date(medication.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Prescribed by:</span>{" "}
                      {medication.prescribedBy}
                    </p>
                    {medication.notes && (
                      <p>
                        <span className="text-muted-foreground">Notes:</span>{" "}
                        {medication.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Medications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Medications</CardTitle>
          <CardDescription>Complete medication history</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMedications && filteredMedications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage & Frequency</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Prescribed By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedications.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          {medication.notes && (
                            <p className="text-sm text-muted-foreground">{medication.notes}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{medication.dosage}</p>
                        <p className="text-sm text-muted-foreground">{medication.frequency}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Start: {new Date(medication.startDate).toLocaleDateString()}</p>
                        {medication.endDate && (
                          <p>End: {new Date(medication.endDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{medication.prescribedBy}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(medication.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(medication.status)}
                          <span>{medication.status}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          {medication.status === "ACTIVE" && (
                            <DropdownMenuItem>Discontinue</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Pill className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No medications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start by prescribing the first medication for this patient."
                }
              </p>
              {!searchTerm && filterStatus === "all" && (
                              <div className="mt-6">
                <Button size="sm" onClick={handlePrescribeMedication}>
                  <Plus className="mr-2 h-4 w-4" />
                  Prescribe Medication
                </Button>
              </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vaccination History */}
      {patient.vaccinations && patient.vaccinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Vaccination History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.vaccinations.map((vaccination) => (
                <div key={vaccination.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{vaccination.vaccine}</p>
                      <p className="text-sm text-muted-foreground">
                        Administered by {vaccination.administeredBy}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {new Date(vaccination.dateAdministered).toLocaleDateString()}
                    </p>
                    {vaccination.nextDue && (
                      <p className="text-muted-foreground">
                        Next due: {new Date(vaccination.nextDue).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? "Edit Medication" : "Prescribe Medication"}
            </DialogTitle>
          </DialogHeader>
          <MedicationForm
            medication={editingMedication}
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
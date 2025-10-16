"use client";

import { useState } from "react";
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  Clock, 
  Plus,
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
import { Patient, MedicalRecord } from "@/types/patient";
import { MedicalRecordForm } from "../forms/medical-record-form";

interface MedicalHistoryProps {
  patient: Patient;
}

export function MedicalHistory({ patient }: MedicalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "type">("date");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const filteredRecords = patient.medicalRecords
    ?.filter((record) => {
      const matchesSearch = record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || record.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.type.localeCompare(b.type);
    });

  const getTypeColor = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "CONSULTATION":
        return "bg-blue-100 text-blue-800";
      case "PROCEDURE":
        return "bg-green-100 text-green-800";
      case "SURGERY":
        return "bg-red-100 text-red-800";
      case "EMERGENCY":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddRecord = () => {
    setEditingRecord(undefined);
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingRecord) {
        console.log("Updating medical record:", { id: editingRecord.id, ...data });
      } else {
        console.log("Creating medical record:", { patientId: patient.id, ...data });
      }
      
      setIsFormOpen(false);
      setEditingRecord(undefined);
      // In real app, you would refetch the patient data here
    } catch (error) {
      console.error("Error saving medical record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingRecord(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical History</h2>
          <p className="text-muted-foreground">
            Complete medical history and treatment records
          </p>
        </div>
        <Button onClick={handleAddRecord}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medical records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="PROCEDURE">Procedure</SelectItem>
                <SelectItem value="SURGERY">Surgery</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "type")}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medical Records Timeline */}
      <div className="space-y-4">
        {filteredRecords && filteredRecords.length > 0 ? (
          filteredRecords.map((record, index) => (
            <Card key={record.id} className="relative">
              {/* Timeline connector */}
              {index < filteredRecords.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-full bg-border z-0"></div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getTypeColor(record.type)}>
                            {record.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {record.department}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold">{record.diagnosis}</h3>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center mt-1">
                          <Stethoscope className="h-4 w-4 mr-1" />
                          {record.doctor}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Treatment</p>
                        <p className="text-sm">{record.treatment}</p>
                      </div>
                      
                      {record.notes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}
                      
                      {record.followUpRequired && (
                        <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Follow-up required
                            {record.followUpDate && ` on ${new Date(record.followUpDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start by adding the first medical record for this patient."
                }
              </p>
              {!searchTerm && filterType === "all" && (
                              <div className="mt-6">
                <Button size="sm" onClick={handleAddRecord}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medical Record
                </Button>
              </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current Diagnoses */}
      {patient.diagnoses && patient.diagnoses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Diagnoses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.diagnoses
                .filter(d => d.status === "ACTIVE" || d.status === "CHRONIC")
                .map((diagnosis) => (
                  <div key={diagnosis.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{diagnosis.name}</p>
                        <p className="text-sm text-muted-foreground">ICD-10: {diagnosis.code}</p>
                      </div>
                      <Badge
                        variant={diagnosis.status === "CHRONIC" ? "secondary" : "default"}
                        className={diagnosis.status === "CHRONIC" ? "bg-purple-100 text-purple-800" : ""}
                      >
                        {diagnosis.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Diagnosed: {new Date(diagnosis.dateOfDiagnosis).toLocaleDateString()}</p>
                      <p>By: {diagnosis.diagnosedBy}</p>
                    </div>
                    {diagnosis.notes && (
                      <p className="text-sm mt-2">{diagnosis.notes}</p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Record Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Medical Record" : "Add Medical Record"}
            </DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            record={editingRecord}
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
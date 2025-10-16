"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PatientForm } from "./patient-form";
import { Patient } from "@/types/patient";
import { toast } from "sonner";

interface PatientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
  mode: "create" | "edit";
}

type PatientFormData = {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  medicalHistory?: string;
  assignedDoctor: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
};

export function PatientSheet({
  open,
  onOpenChange,
  patient,
  mode,
}: PatientSheetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (mode === "create") {
        // Here you would typically make an API call to create the patient
        console.log("Creating patient:", data);
        toast.success("Patient created successfully!");
      } else {
        // Here you would typically make an API call to update the patient
        console.log("Updating patient:", { id: patient?.id, ...data });
        toast.success("Patient updated successfully!");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving patient:", error);
      toast.error("Failed to save patient. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add New Patient" : "Edit Patient"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Fill in the details below to add a new patient to the system."
              : "Update the patient information below."}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          <PatientForm
            patient={patient}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrescriptionForm } from "./prescription-form";

type AddPrescriptionDialogProps = {
  visitId: string;
  employeeId: string;
};

export const AddPrescriptionDialog = ({
  visitId,
  employeeId,
}: AddPrescriptionDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить назначение</DialogTitle>
        </DialogHeader>
        <PrescriptionForm
          visitId={visitId}
          employeeId={employeeId}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

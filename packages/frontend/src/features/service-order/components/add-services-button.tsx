"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddServicesDialog } from "./add-services-dialog";

type AddServicesButtonProps = {
  visitId: string;
  patientId: string;
  doctorId: string;
};

export const AddServicesButton = ({
  visitId,
  patientId,
  doctorId,
}: AddServicesButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Добавить
      </Button>
      <AddServicesDialog
        open={open}
        onOpenChange={setOpen}
        visitId={visitId}
        patientId={patientId}
        doctorId={doctorId}
      />
    </>
  );
};

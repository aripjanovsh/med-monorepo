import type { DialogProps } from "@/lib/dialog-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisitForm } from "./visit-form";
import type { VisitFormData } from "../visit.schema";

type VisitFormDialogProps = DialogProps & {
  mode: "create" | "edit";
  initialData?: VisitFormData & { id?: string };
  patientId?: string;
  onSuccess?: () => void;
};

export const VisitFormDialog = ({
  open,
  onOpenChange,
  mode,
  initialData,
  patientId,
  onSuccess,
}: VisitFormDialogProps) => {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Записать на прием" : "Редактировать прием"}
          </DialogTitle>
        </DialogHeader>
        <VisitForm
          mode={mode}
          initialData={initialData}
          patientId={patientId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

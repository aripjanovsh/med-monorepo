import * as yup from "yup";

export const prescriptionFormSchema = yup.object({
  name: yup
    .string()
    .min(2, "Минимум 2 символа")
    .required("Название препарата обязательно"),
  dosage: yup.string().optional(),
  frequency: yup.string().optional(),
  duration: yup.string().optional(),
  notes: yup.string().optional(),
});

export const createPrescriptionRequestSchema = yup.object({
  visitId: yup.string().required(),
  name: yup.string().required(),
  dosage: yup.string().optional(),
  frequency: yup.string().optional(),
  duration: yup.string().optional(),
  notes: yup.string().optional(),
  createdById: yup.string().required(),
});

export type PrescriptionFormData = yup.InferType<
  typeof prescriptionFormSchema
>;

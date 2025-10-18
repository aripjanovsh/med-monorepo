import * as yup from "yup";

export const labOrderFormSchema = yup.object({
  testName: yup
    .string()
    .min(2, "Минимум 2 символа")
    .required("Название анализа обязательно"),
  notes: yup.string().optional(),
});

export const createLabOrderRequestSchema = yup.object({
  visitId: yup.string().required(),
  testName: yup.string().required(),
  notes: yup.string().optional(),
  createdById: yup.string().required(),
});

export type LabOrderFormData = yup.InferType<typeof labOrderFormSchema>;

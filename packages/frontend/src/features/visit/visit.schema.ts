import * as yup from "yup";

export const visitFormSchema = yup.object({
  appointmentId: yup.string().optional(),
  patientId: yup.string().required("Пациент обязателен"),
  employeeId: yup.string().required("Врач обязателен"),
  visitDate: yup.string().optional(),
  protocolId: yup.string().optional(),
  notes: yup.string().optional(),
});

export const createVisitRequestSchema = yup.object({
  appointmentId: yup.string().optional(),
  patientId: yup.string().required(),
  employeeId: yup.string().required(),
  visitDate: yup.string().optional(), // ISO string
  protocolId: yup.string().optional(),
  notes: yup.string().optional(),
});

export const updateVisitRequestSchema = createVisitRequestSchema
  .partial()
  .shape({
    id: yup.string().required(),
  });

export type VisitFormData = yup.InferType<typeof visitFormSchema>;

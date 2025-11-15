import * as yup from "yup";

export const createVisitRequestSchema = yup.object({
  appointmentId: yup.string().optional(),
  patientId: yup.string().required("Пациент обязателен"),
  employeeId: yup.string().required("Врач обязателен"),
  serviceId: yup.string().optional(),
  type: yup.string().optional(),
  visitDate: yup.string().optional(), // ISO string
  protocolId: yup.string().optional(),
  notes: yup.string().optional(),
});

export const visitFormSchema = createVisitRequestSchema;

export const updateVisitRequestSchema = createVisitRequestSchema
  .partial()
  .shape({
    id: yup.string().required(),
  });

export type VisitFormData = yup.InferType<typeof createVisitRequestSchema>;

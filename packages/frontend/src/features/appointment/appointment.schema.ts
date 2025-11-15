import * as yup from "yup";

export const appointmentFormSchema = yup.object({
  scheduledAt: yup.string().required("Дата и время обязательны"),
  duration: yup
    .number()
    .required("Длительность обязательна")
    .min(1, "Минимальная длительность 1 минута"),
  notes: yup.string().optional(),
  reason: yup.string().optional(),
  roomNumber: yup.string().optional(),
  patientId: yup.string().required("Пациент обязателен"),
  employeeId: yup.string().required("Врач обязателен"),
  serviceId: yup.string().optional(),
});

export const createAppointmentRequestSchema = yup.object({
  scheduledAt: yup.string().required(),
  duration: yup.number().required().min(1),
  notes: yup.string().optional(),
  reason: yup.string().optional(),
  roomNumber: yup.string().optional(),
  patientId: yup.string().required(),
  employeeId: yup.string().required(),
  serviceId: yup.string().optional(),
  createdById: yup.string().required(),
});

export const updateAppointmentRequestSchema = createAppointmentRequestSchema
  .partial()
  .shape({
    id: yup.string().required(),
  });

export type AppointmentFormData = yup.InferType<typeof appointmentFormSchema>;

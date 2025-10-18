import * as yup from "yup";

export const protocolTemplateFormSchema = yup.object({
  name: yup
    .string()
    .min(2, "Название должно содержать минимум 2 символа")
    .required("Название протокола обязательно"),
  description: yup
    .string()
    .min(10, "Описание должно содержать минимум 10 символов")
    .required("Описание протокола обязательно"),
  content: yup
    .string()
    .test("is-valid-json", "Содержимое должно быть валидным JSON", (value) => {
      if (!value) return false;
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    })
    .required("Содержимое протокола обязательно"),
  isActive: yup.boolean().default(true),
});

export const createProtocolTemplateRequestSchema = yup.object({
  name: yup.string().required("Название протокола обязательно"),
  description: yup.string().required("Описание протокола обязательно"),
  content: yup
    .string()
    .test("is-valid-json", "Содержимое должно быть валидным JSON", (value) => {
      if (!value) return false;
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    })
    .required("Содержимое протокола обязательно"),
});

export const updateProtocolTemplateRequestSchema = createProtocolTemplateRequestSchema
  .partial()
  .shape({
    id: yup.string().required(),
    isActive: yup.boolean(),
  });

export type ProtocolTemplateFormData = yup.InferType<typeof protocolTemplateFormSchema>;

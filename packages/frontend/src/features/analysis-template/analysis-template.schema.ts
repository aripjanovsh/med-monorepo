import * as yup from "yup";
import { PARAMETER_TYPE } from "./analysis-template.constants";

// Reference range schema
const referenceRangeSchema = yup.object({
  min: yup.number().optional(),
  max: yup.number().optional(),
});

// Reference ranges schema - allow any string keys
const referenceRangesSchema = yup.lazy((obj) =>
  yup.object(
    Object.keys(obj || {}).reduce(
      (acc, key) => ({
        ...acc,
        [key]: referenceRangeSchema.optional(),
      }),
      {}
    )
  )
);

// Analysis parameter schema for form
const analysisParameterFormSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().min(2, "Название должно содержать минимум 2 символа").required("Название обязательно"),
  unit: yup.string().optional(),
  type: yup
    .string()
    .oneOf(Object.values(PARAMETER_TYPE))
    .required("Тип обязателен"),
  referenceRanges: referenceRangesSchema.optional(),
  isRequired: yup.boolean().default(false),
});

// Analysis section schema for form
const analysisSectionFormSchema = yup.object({
  id: yup.string().required(),
  title: yup.string().min(2, "Название секции должно содержать минимум 2 символа").required("Название секции обязательно"),
  description: yup.string().optional(),
  parameters: yup
    .array()
    .of(analysisParameterFormSchema)
    .min(1, "Добавьте хотя бы один параметр в секцию")
    .required(),
});

// Analysis parameter schema for API request (without id)
const analysisParameterRequestSchema = yup.object({
  name: yup.string().min(2).required(),
  unit: yup.string().optional(),
  type: yup.string().oneOf(Object.values(PARAMETER_TYPE)).required(),
  referenceRanges: referenceRangesSchema.optional(),
  isRequired: yup.boolean().default(false),
});

// Analysis section schema for API request (without id)
const analysisSectionRequestSchema = yup.object({
  title: yup.string().min(2).required(),
  description: yup.string().optional(),
  parameters: yup.array().of(analysisParameterRequestSchema).min(1).required(),
});

// Form schema (includes UI-only fields)
export const analysisTemplateFormSchema = yup.object({
  id: yup.string().optional(), // For edit mode
  name: yup
    .string()
    .min(2, "Название должно содержать минимум 2 символа")
    .required("Название обязательно"),
  code: yup
    .string()
    .min(2, "Код должен содержать минимум 2 символа")
    .required("Код обязателен"),
  description: yup.string().optional(),
  template: yup.object({
    version: yup.number().default(1),
    sections: yup
      .array()
      .of(analysisSectionFormSchema)
      .min(1, "Добавьте хотя бы одну секцию")
      .required(),
  }).required(),
});

// Create request schema
export const createAnalysisTemplateRequestSchema = yup.object({
  name: yup.string().min(2).required(),
  code: yup.string().min(2).required(),
  description: yup.string().optional(),
  content: yup.string().required(), // JSON string
});

// Update request schema
export const updateAnalysisTemplateRequestSchema =
  createAnalysisTemplateRequestSchema.partial().shape({
    id: yup.string().required(),
  });

// Type inference
export type AnalysisTemplateFormData = yup.InferType<
  typeof analysisTemplateFormSchema
>;
export type CreateAnalysisTemplateRequestData = yup.InferType<
  typeof createAnalysisTemplateRequestSchema
>;
export type UpdateAnalysisTemplateRequestData = yup.InferType<
  typeof updateAnalysisTemplateRequestSchema
>;

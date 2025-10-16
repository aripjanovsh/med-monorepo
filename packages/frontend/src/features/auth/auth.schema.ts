import * as yup from "yup";

export const loginSchema = yup.object({
  phone: yup.string().required("Phone is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

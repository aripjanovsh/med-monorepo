import {
  useForm as useReactHookForm,
  UseFormProps,
  FieldValues,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AnyObjectSchema } from "yup";

interface UseFormConfig<T>
  extends Omit<UseFormProps<T & FieldValues>, "resolver"> {
  schema: AnyObjectSchema;
}

/**
 * Custom hook that combines react-hook-form with yup validation
 * Use this hook for all forms in the project
 */
export function useForm<T extends Record<string, any>>({
  schema,
  ...props
}: UseFormConfig<T>) {
  return useReactHookForm<T>({
    resolver: yupResolver(schema),
    ...props,
  });
}

import { get } from "lodash";
import { UseFormSetError, Path, FieldValues } from "react-hook-form";

export const handleFieldErrors = <T extends FieldValues>(
  errorResponse: unknown,
  setFormError: UseFormSetError<T>,
) => {
  const fieldErrors = get(errorResponse, "data.fieldErrors");

  if (fieldErrors) {
    Object.keys(fieldErrors).forEach((field) => {
      setFormError(field as Path<T>, {
        message: get(fieldErrors, [field, 0], "An error occurred"),
      });
    });
  }
};

export const handleBatchFieldErrors = <T extends FieldValues>(
  setFormError: UseFormSetError<T>,
  errorResponse: unknown,
  arrayFieldName: string = "members",
) => {
  const fieldErrors = get(errorResponse, "data.fieldErrors");

  if (fieldErrors) {
    Object.keys(fieldErrors).forEach((field) => {
      // Parse field format like "email[0]" to "members.0.email"
      const match = field.match(/^([a-zA-Z]+)\[(\d+)\]$/);
      if (match) {
        const [, fieldName, index] = match;
        const formFieldPath =
          `${arrayFieldName}.${index}.${fieldName}` as Path<T>;
        setFormError(formFieldPath, {
          message: get(fieldErrors, [field, 0], "An error occurred"),
        });
      } else {
        // Fallback for non-array fields
        setFormError(field as Path<T>, {
          message: get(fieldErrors, [field, 0], "An error occurred"),
        });
      }
    });
  }
};

export const url = (
  url: string,
  params?: Record<string, string | number>,
): string => {
  if (!params) return url;

  return url.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    if (key in params) {
      return encodeURIComponent(String(params[key]));
    } else {
      throw new Error(`Missing parameter: ${key}`);
    }
  });
};

export const normalizeWebsite = (website?: string) => {
  if (!website) return "";

  if (website.startsWith("http") || website.startsWith("https")) {
    return website;
  }

  return `https://${website}`;
};

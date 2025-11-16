/**
 * Calculate the difference between two objects
 * Returns only the fields that changed with their old and new values
 */
export const calculateDiff = (
  oldData: Record<string, any>,
  newData: Record<string, any>
): Record<string, { old: any; new: any }> => {
  const diff: Record<string, { old: any; new: any }> = {};

  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {}),
  ]);

  for (const key of allKeys) {
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      continue;
    }

    // Skip metadata fields that we don't want to track
    if (
      key === "createdAt" ||
      key === "updatedAt" ||
      key === "password" ||
      key === "organizationId"
    ) {
      continue;
    }

    diff[key] = {
      old: oldValue,
      new: newValue,
    };
  }

  return diff;
};

/**
 * Sanitize data before logging (remove sensitive fields)
 */
export const sanitizeForAudit = (data: any): any => {
  if (!data || typeof data !== "object") {
    return data;
  }

  const sanitized = { ...data };
  const sensitiveFields = ["password", "token", "secret", "accessToken"];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
};

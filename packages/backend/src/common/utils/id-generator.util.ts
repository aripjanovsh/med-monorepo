import type { PrismaClient } from "@prisma/client";

/**
 * Entity ID prefixes
 */
export const ENTITY_PREFIXES = {
  PATIENT: "PAT",
  EMPLOYEE: "EMP",
  INVOICE: "INV",
  VISIT: "VIS",
  APPOINTMENT: "APP",
} as const;

export type EntityPrefix =
  (typeof ENTITY_PREFIXES)[keyof typeof ENTITY_PREFIXES];

/**
 * Table names corresponding to entity prefixes
 */
const ENTITY_TABLE_MAP: Record<EntityPrefix, string> = {
  PAT: "patient",
  EMP: "employee",
  INV: "invoice",
  VIS: "visit",
  APP: "appointment",
};

/**
 * ID field names for each entity
 */
const ENTITY_ID_FIELD_MAP: Record<EntityPrefix, string> = {
  PAT: "patientId",
  EMP: "employeeId",
  INV: "invoiceNumber",
  VIS: "visitId",
  APP: "appointmentId",
};

/**
 * Generate a sequential entity ID with format: PREFIXYYYMM-NNNN
 * Example: PAT2512-0001, EMP2512-0002, INV2512-0003
 *
 * The sequence is per organization and per month.
 *
 * @param prisma - Prisma client or transaction
 * @param prefix - Entity prefix (PAT, EMP, INV, VIS, APP)
 * @param organizationId - Organization ID for scoping the sequence
 * @returns Generated ID (e.g., 'PAT2512-0001')
 */
export async function generateEntityId(
  prisma:
    | PrismaClient
    | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0],
  prefix: EntityPrefix,
  organizationId: string
): Promise<string> {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const yearMonth = `${year}${month}`;

  const idPrefix = `${prefix}${yearMonth}-`;

  // Get the table and field name for this entity
  const tableName = ENTITY_TABLE_MAP[prefix];
  const idField = ENTITY_ID_FIELD_MAP[prefix];

  // Count existing records with this prefix pattern for this organization in this month
  // Using raw query for flexibility across different tables
  const result = await (prisma as PrismaClient).$queryRawUnsafe<
    { count: bigint }[]
  >(
    `SELECT COUNT(*) as count FROM ${tableName}s WHERE "organizationId" = $1 AND "${idField}" LIKE $2`,
    organizationId,
    `${idPrefix}%`
  );

  const count = Number(result[0]?.count ?? 0);
  const nextNumber = String(count + 1).padStart(4, "0");

  return `${idPrefix}${nextNumber}`;
}

/**
 * Generate entity ID for seeding purposes (synchronous, uses provided count)
 *
 * @param prefix - Entity prefix (PAT, EMP, INV, VIS, APP)
 * @param sequenceNumber - The sequence number to use
 * @param date - Optional date to use for year/month (defaults to now)
 * @returns Generated ID (e.g., 'PAT2512-0001')
 */
export function generateEntityIdSync(
  prefix: EntityPrefix,
  sequenceNumber: number,
  date?: Date
): string {
  const targetDate = date ?? new Date();
  const year = String(targetDate.getFullYear()).slice(-2);
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const yearMonth = `${year}${month}`;
  const paddedNumber = String(sequenceNumber).padStart(4, "0");

  return `${prefix}${yearMonth}-${paddedNumber}`;
}

/**
 * Convert camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

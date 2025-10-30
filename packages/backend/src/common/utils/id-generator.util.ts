import { customAlphabet } from "nanoid";

/**
 * Utility for generating unique memorable IDs
 *
 * Format: PREFIX-XXXX-YYYY
 * Example: PAT-A8K4-7M2N, EMP-B9P3-5R8T
 *
 * Uses custom alphabet without confusing characters (0,O,I,1,l)
 * Total possible combinations: 32^8 = ~1.2 trillion
 */

// Custom alphabet without confusing characters: 0,O,I,1,l
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// Create nanoid generator with custom alphabet
const generateSegment = customAlphabet(ALPHABET, 3);

/**
 * Generate a unique memorable ID with prefix and random segments
 * @param prefix - Prefix for the ID (e.g., 'PAT', 'EMP')
 * @returns Generated ID (e.g., 'PAT-A8K4-7M2N', 'EMP-B9P3-5R8T')
 */
export function generateMemorableId(prefix: string): string {
  const segment1 = generateSegment();
  const segment2 = generateSegment();
  return `${prefix}-${segment1}-${segment2}`;
}

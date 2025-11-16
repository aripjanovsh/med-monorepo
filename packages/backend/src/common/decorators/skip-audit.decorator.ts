import { SetMetadata } from "@nestjs/common";

export const SKIP_AUDIT_KEY = "skipAudit";

/**
 * Decorator to skip audit logging for specific endpoints
 * @example
 * @SkipAudit()
 * @Get()
 * findAll() {
 *   return this.service.findAll();
 * }
 */
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);

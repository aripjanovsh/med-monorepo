import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TenantService } from "./tenant.service";

export interface RequestWithTenant extends Request {
  organizationId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  use(req: RequestWithTenant, res: Response, next: NextFunction) {
    // Organization ID will be set from user data in TenantGuard after authentication
    // This middleware is kept for compatibility but no longer extracts organizationId from external sources
    next();
  }
}

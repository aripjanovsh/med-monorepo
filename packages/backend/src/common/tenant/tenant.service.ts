import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private organizationId: string;

  setOrganizationId(organizationId: string): void {
    this.organizationId = organizationId;
  }

  getOrganizationId(): string {
    return this.organizationId;
  }

  hasOrganization(): boolean {
    return !!this.organizationId;
  }
}

export type EmployeeAvailabilityDto = {
  id: string;
  employeeId: string;
  startsOn: string;
  until?: string;
  startTime: string;
  endTime: string;
  repeatOn: string[];
  note?: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeeAvailabilityRequestDto = {
  employeeId: string;
  startsOn: string;
  until?: string | null;
  startTime: string;
  endTime: string;
  repeatOn: string[];
  note?: string | null;
  isActive?: boolean;
};

export type UpdateEmployeeAvailabilityRequestDto =
  Partial<CreateEmployeeAvailabilityRequestDto>;

export type EmployeeAvailabilityQueryDto = {
  employeeId?: string;
  page?: number;
  limit?: number;
};

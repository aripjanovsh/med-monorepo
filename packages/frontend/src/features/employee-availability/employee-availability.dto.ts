export type EmployeeAvailabilityDto = {
  id: string;
  employeeId: string;
  startsOn: string;
  until?: string;
  startTime: string;
  endTime: string;
  repeatOn: number[];
  note?: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeeAvailabilityRequestDto = {
  employeeId: string;
  startsOn: string;
  until?: string;
  startTime: string;
  endTime: string;
  repeatOn: number[];
  note?: string;
  isActive?: boolean;
};

export type UpdateEmployeeAvailabilityRequestDto =
  Partial<CreateEmployeeAvailabilityRequestDto>;

export type EmployeeAvailabilityQueryDto = {
  employeeId?: string;
  page?: number;
  limit?: number;
};

export type LeaveTypeDto = {
  id: string;
  name: string;
  code?: string;
  color?: string;
  isPaid: boolean;
};

export type EmployeeLeaveDaysDto = {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveType?: LeaveTypeDto;
  startsOn: string;
  until: string;
  note?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeeLeaveDaysRequestDto = {
  employeeId: string;
  leaveTypeId: string;
  startsOn: string;
  until: string;
  note?: string;
};

export type UpdateEmployeeLeaveDaysRequestDto =
  Partial<CreateEmployeeLeaveDaysRequestDto>;

export type EmployeeLeaveDaysQueryDto = {
  employeeId?: string;
  leaveTypeId?: string;
  page?: number;
  limit?: number;
};

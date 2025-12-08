export interface GlobalSearchPatientDto {
  id: string;
  patientId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface GlobalSearchEmployeeDto {
  id: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  title?: {
    id: string;
    name: string;
  };
  avatarId?: string;
}

export interface GlobalSearchResponseDto {
  patients: GlobalSearchPatientDto[];
  employees: GlobalSearchEmployeeDto[];
}

export interface GlobalSearchQueryParams {
  search: string;
  limit?: number;
}

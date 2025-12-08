"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Users } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobalSearchQuery } from "../global-search.api";
import type {
  GlobalSearchPatientDto,
  GlobalSearchEmployeeDto,
} from "../global-search.dto";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface GlobalSearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onPatientSelect?: (patient: GlobalSearchPatientDto) => void;
  onEmployeeSelect?: (employee: GlobalSearchEmployeeDto) => void;
}

export function GlobalSearchAutocomplete({
  placeholder = "Поиск по имени пациента, сотрудника или ID...",
  className,
  onPatientSelect,
  onEmployeeSelect,
}: GlobalSearchAutocompleteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGlobalSearchQuery(
    { search: debouncedSearch, limit: 10 },
    { skip: debouncedSearch.length < 2 }
  );

  const hasResults = useMemo(() => {
    return (
      (data?.patients && data.patients.length > 0) ||
      (data?.employees && data.employees.length > 0)
    );
  }, [data]);

  const formatPatientName = useCallback((patient: GlobalSearchPatientDto) => {
    const parts = [
      patient.lastName,
      patient.firstName,
      patient.middleName,
    ].filter(Boolean);
    return parts.join(" ");
  }, []);

  const formatEmployeeName = useCallback(
    (employee: GlobalSearchEmployeeDto) => {
      const parts = [
        employee.lastName,
        employee.firstName,
        employee.middleName,
      ].filter(Boolean);
      return parts.join(" ");
    },
    []
  );

  const handlePatientSelect = useCallback(
    (patient: GlobalSearchPatientDto) => {
      if (onPatientSelect) {
        onPatientSelect(patient);
      } else {
        router.push(`/cabinet/appointments/patient/${patient.id}`);
      }
      setSearch("");
    },
    [onPatientSelect, router]
  );

  const handleEmployeeSelect = useCallback(
    (employee: GlobalSearchEmployeeDto) => {
      if (onEmployeeSelect) {
        onEmployeeSelect(employee);
      } else {
        router.push(`/cabinet/appointments/employee/${employee.id}`);
      }
      setSearch("");
    },
    [onEmployeeSelect, router]
  );

  return (
    <Command className={className} shouldFilter={false}>
      <CommandInput
        placeholder={placeholder}
        value={search}
        onValueChange={setSearch}
        className="h-12"
      />
      <CommandList>
        {debouncedSearch.length >= 2 && !isLoading && !hasResults && (
          <CommandEmpty>Ничего не найдено</CommandEmpty>
        )}

        {isLoading && debouncedSearch.length >= 2 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Поиск...
          </div>
        )}

        {data?.employees && data.employees.length > 0 && (
          <CommandGroup heading="Сотрудники">
            {data.employees.map((employee) => (
              <CommandItem
                key={employee.id}
                value={`employee-${employee.id}`}
                onSelect={() => handleEmployeeSelect(employee)}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{formatEmployeeName(employee)}</span>
                  <span className="text-xs text-muted-foreground">
                    ID: {employee.employeeId}
                    {employee.title && ` • ${employee.title.name}`}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data?.patients && data.patients.length > 0 && (
          <CommandGroup heading="Пациенты">
            {data.patients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={`patient-${patient.id}`}
                onSelect={() => handlePatientSelect(patient)}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{formatPatientName(patient)}</span>
                  <span className="text-xs text-muted-foreground">
                    ID: {patient.patientId}
                    {patient.phone && ` • ${patient.phone}`}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Search, User, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetPatientsQuery } from "@/features/patients/patient.api";
import type { PatientResponseDto } from "@/features/patients/patient.dto";
import { useDebounce } from "@/hooks/use-debounce";

type QuickSearchWidgetProps = {
  onPatientSelect: (patientId: string) => void;
  placeholder?: string;
};

export const QuickSearchWidget = ({
  onPatientSelect,
  placeholder = "Поиск пациента...",
}: QuickSearchWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: patientsData, isLoading } = useGetPatientsQuery(
    { search: debouncedSearch, limit: 10, page: 1 },
    { skip: debouncedSearch.length < 2 }
  );

  const searchResults = patientsData?.data;

  const handleSelect = useCallback(
    (patientId: string) => {
      onPatientSelect(patientId);
      setOpen(false);
      setSearchValue("");
    },
    [onPatientSelect]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start text-left font-normal"
        >
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="text-muted-foreground">{placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Введите ФИО или телефон..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm">Поиск...</div>
            )}
            {!isLoading && debouncedSearch.length < 2 && (
              <CommandEmpty>
                Введите минимум 2 символа для поиска
              </CommandEmpty>
            )}
            {!isLoading &&
              debouncedSearch.length >= 2 &&
              (!searchResults || searchResults.length === 0) && (
                <CommandEmpty>Пациенты не найдены</CommandEmpty>
              )}
            {!isLoading && searchResults && searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((patient: PatientResponseDto) => (
                  <CommandItem
                    key={patient.id}
                    value={patient.id}
                    onSelect={() => handleSelect(patient.id)}
                    className="flex items-center gap-2 py-3"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {patient.lastName} {patient.firstName}{" "}
                        {patient.middleName}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {patient.contacts?.[0]?.primaryPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.contacts[0].primaryPhone}
                          </span>
                        )}
                        {patient.dateOfBirth && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(patient.dateOfBirth).toLocaleDateString(
                              "ru-RU"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

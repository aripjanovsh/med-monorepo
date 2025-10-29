"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, IdCard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Patient = {
  id: string;
  name: string;
  phone: string;
  birthDate: string;
  patientId: string;
};

export function QuickPatientSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - filtered based on search
  const allPatients: Patient[] = [
    {
      id: "1",
      name: "Иванова Мария Петровна",
      phone: "+7 (999) 123-45-67",
      birthDate: "15.03.1985",
      patientId: "P-001234",
    },
    {
      id: "2",
      name: "Сидоров Иван Иванович",
      phone: "+7 (999) 234-56-78",
      birthDate: "22.07.1990",
      patientId: "P-001235",
    },
    {
      id: "3",
      name: "Кузнецова Анна Сергеевна",
      phone: "+7 (999) 345-67-89",
      birthDate: "08.12.1978",
      patientId: "P-001236",
    },
  ];

  const filteredPatients = searchQuery
    ? allPatients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone.includes(searchQuery) ||
          patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ФИО, телефон или ID пациента..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {searchQuery && (
        <ScrollArea className="h-[200px]">
          {filteredPatients.length > 0 ? (
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="rounded-lg border p-3 hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{patient.name}</p>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IdCard className="h-3 w-3" />
                        <span>{patient.patientId}</span>
                        <span>•</span>
                        <span>ДР: {patient.birthDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
              Пациенты не найдены
            </div>
          )}
        </ScrollArea>
      )}

      {!searchQuery && (
        <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
          Начните вводить для поиска
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, User, FileText } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionSheetProps {
  children: React.ReactNode;
}

export function PrescriptionSheet({ children }: PrescriptionSheetProps) {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Mock patient data
  const patients = [
    { id: "1", name: "Анна Иванова", age: 34 },
    { id: "2", name: "Петр Сидоров", age: 45 },
    { id: "3", name: "Мария Петрова", age: 28 },
    { id: "4", name: "Дмитрий Волков", age: 52 },
  ];

  // Common medications
  const commonMedications = [
    "Парацетамол",
    "Ибупрофен",
    "Амоксициллин",
    "Азитромицин",
    "Лоратадин",
    "Омепразол",
    "Метформин",
    "Аспирин",
  ];

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id));
    }
  };

  const updateMedication = (
    id: string,
    field: keyof Medication,
    value: string
  ) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  const handleSavePrescription = () => {
    // Here you would typically save the prescription to your backend
    console.log("Prescription data:", {
      patient: selectedPatient,
      diagnosis,
      medications,
      notes,
      date: new Date().toISOString(),
    });

    // Reset form
    setSelectedPatient("");
    setMedications([
      {
        id: "1",
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
    setDiagnosis("");
    setNotes("");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Создать рецепт
          </SheetTitle>
          <SheetDescription>
            Создайте новый рецепт для пациента с указанием лекарственных
            препаратов и дозировки
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Пациент
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedPatient}
                onValueChange={setSelectedPatient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите пациента" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.age} лет)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Диагноз</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Введите диагноз"
            />
          </div>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Лекарственные препараты
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <Card key={medication.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">Препарат {index + 1}</Badge>
                      {medications.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(medication.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Название препарата</Label>
                        <Select
                          value={medication.name}
                          onValueChange={(value) =>
                            updateMedication(medication.id, "name", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите препарат" />
                          </SelectTrigger>
                          <SelectContent>
                            {commonMedications.map((med) => (
                              <SelectItem key={med} value={med}>
                                {med}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Дозировка</Label>
                        <Input
                          value={medication.dosage}
                          onChange={(e) =>
                            updateMedication(
                              medication.id,
                              "dosage",
                              e.target.value
                            )
                          }
                          placeholder="например, 500мг"
                        />
                      </div>

                      <div>
                        <Label>Частота приема</Label>
                        <Select
                          value={medication.frequency}
                          onValueChange={(value) =>
                            updateMedication(medication.id, "frequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите частоту" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-times">
                              1 раз в день
                            </SelectItem>
                            <SelectItem value="2-times">
                              2 раза в день
                            </SelectItem>
                            <SelectItem value="3-times">
                              3 раза в день
                            </SelectItem>
                            <SelectItem value="4-times">
                              4 раза в день
                            </SelectItem>
                            <SelectItem value="as-needed">
                              По необходимости
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Продолжительность</Label>
                        <Input
                          value={medication.duration}
                          onChange={(e) =>
                            updateMedication(
                              medication.id,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="например, 7 дней"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Инструкции по применению</Label>
                      <Textarea
                        value={medication.instructions}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "instructions",
                            e.target.value
                          )
                        }
                        placeholder="Дополнительные инструкции..."
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Дополнительные примечания</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация для пациента или фармацевта..."
              rows={3}
            />
          </div>
        </SheetBody>

        {/* Action Buttons */}
        <SheetFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleSavePrescription}
            disabled={
              !selectedPatient ||
              !diagnosis ||
              medications.some((med) => !med.name)
            }
          >
            Сохранить рецепт
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

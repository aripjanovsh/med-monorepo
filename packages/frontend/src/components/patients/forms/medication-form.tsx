"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Medication } from "@/types/patient";
import { cn } from "@/lib/utils";

const medicationSchema = z.object({
  name: z.string().min(2, "Medication name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  startDate: z.date({
    message: "Start date is required",
  }),
  endDate: z.date().optional(),
  prescribedBy: z
    .string()
    .min(2, "Prescribing doctor must be at least 2 characters"),
  status: z.enum(["ACTIVE", "DISCONTINUED", "COMPLETED"]),
  notes: z.string().optional(),
  hasEndDate: z.boolean().default(false),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  medication?: Medication;
  patientId: string;
  onSubmit: (data: Omit<MedicationFormData, "hasEndDate">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MedicationForm({
  medication,
  patientId,
  onSubmit,
  onCancel,
  isLoading,
}: MedicationFormProps) {
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: medication?.name || "",
      dosage: medication?.dosage || "",
      frequency: medication?.frequency || "",
      startDate: medication ? new Date(medication.startDate) : new Date(),
      endDate: medication?.endDate ? new Date(medication.endDate) : undefined,
      prescribedBy: medication?.prescribedBy || "",
      status: medication?.status || "ACTIVE",
      notes: medication?.notes || "",
      hasEndDate: !!medication?.endDate,
    },
  });

  const hasEndDate = form.watch("hasEndDate");

  const handleSubmit = (data: MedicationFormData) => {
    const { hasEndDate: _, ...submitData } = data;
    if (!hasEndDate) {
      submitData.endDate = undefined;
    }
    onSubmit(submitData);
  };

  // Common medications for autocomplete suggestions
  const commonMedications = [
    "Aspirin",
    "Ibuprofen",
    "Acetaminophen",
    "Metformin",
    "Lisinopril",
    "Amlodipine",
    "Metoprolol",
    "Hydrochlorothiazide",
    "Simvastatin",
    "Omeprazole",
    "Levothyroxine",
    "Albuterol",
    "Prednisone",
    "Amoxicillin",
    "Azithromycin",
  ];

  // Common dosages
  const commonDosages = [
    "5mg",
    "10mg",
    "20mg",
    "25mg",
    "50mg",
    "100mg",
    "200mg",
    "500mg",
    "1g",
    "2.5mg",
    "7.5mg",
    "15mg",
    "30mg",
    "40mg",
    "80mg",
  ];

  // Common frequencies
  const frequencies = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Before meals",
    "After meals",
    "At bedtime",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Medication Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter medication name" {...field} />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground">
                Common: {commonMedications.slice(0, 5).join(", ")}
              </div>
            </FormItem>
          )}
        />

        {/* Dosage and Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or enter dosage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonDosages.map((dosage) => (
                      <SelectItem key={dosage} value={dosage}>
                        {dosage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Prescribing Doctor and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prescribedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prescribed By</FormLabel>
                <FormControl>
                  <Input placeholder="Enter prescribing doctor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Start Date */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date Toggle */}
        <FormField
          control={form.control}
          name="hasEndDate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Set End Date</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Specify when this medication should be discontinued
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* End Date (conditional) */}
        {hasEndDate && (
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const startDate = form.getValues("startDate");
                        return date < startDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions/Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Special instructions, side effects to watch for, etc."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? "Saving..."
              : medication
                ? "Update Medication"
                : "Prescribe Medication"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

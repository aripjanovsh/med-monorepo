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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VitalSign } from "@/types/patient";
import { cn } from "@/lib/utils";

const vitalSignsSchema = z.object({
  date: z.date({
    message: "Date is required",
  }),
  bloodPressureSystolic: z.number().min(50).max(300).optional(),
  bloodPressureDiastolic: z.number().min(30).max(200).optional(),
  heartRate: z.number().min(30).max(250).optional(),
  temperature: z.number().min(90).max(110).optional(),
  weight: z.number().min(1).max(500).optional(),
  height: z.number().min(50).max(250).optional(),
  oxygenSaturation: z.number().min(70).max(100).optional(),
  respiratoryRate: z.number().min(8).max(50).optional(),
  recordedBy: z.string().min(2, "Recorded by must be at least 2 characters"),
});

type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;

interface VitalSignsFormProps {
  vitalSign?: VitalSign;
  patientId: string;
  onSubmit: (data: VitalSignsFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VitalSignsForm({
  vitalSign,
  patientId,
  onSubmit,
  onCancel,
  isLoading,
}: VitalSignsFormProps) {
  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: {
      date: vitalSign ? new Date(vitalSign.date) : new Date(),
      bloodPressureSystolic: vitalSign?.bloodPressureSystolic || undefined,
      bloodPressureDiastolic: vitalSign?.bloodPressureDiastolic || undefined,
      heartRate: vitalSign?.heartRate || undefined,
      temperature: vitalSign?.temperature || undefined,
      weight: vitalSign?.weight || undefined,
      height: vitalSign?.height || undefined,
      oxygenSaturation: vitalSign?.oxygenSaturation || undefined,
      respiratoryRate: vitalSign?.respiratoryRate || undefined,
      recordedBy: vitalSign?.recordedBy || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date and Recorded By */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
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
                          <span>Pick a date</span>
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

          <FormField
            control={form.control}
            name="recordedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recorded By</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter name of person recording"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Blood Pressure */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Blood Pressure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bloodPressureSystolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic (mmHg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 120"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bloodPressureDiastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic (mmHg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 80"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Heart Rate and Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="heartRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heart Rate (bpm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 72"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°F)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 98.6"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Weight and Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70.5"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 175"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Oxygen Saturation and Respiratory Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="oxygenSaturation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oxygen Saturation (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 98"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="respiratoryRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Respiratory Rate (breaths/min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 16"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reference Ranges Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Normal Ranges (Adults)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
            <div>BP: 90-140 / 60-90 mmHg</div>
            <div>HR: 60-100 bpm</div>
            <div>Temp: 97.0-100.4°F</div>
            <div>O2 Sat: 95-100%</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? "Saving..."
              : vitalSign
                ? "Update Vital Signs"
                : "Record Vital Signs"}
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

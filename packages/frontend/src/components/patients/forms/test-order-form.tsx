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
import { Checkbox } from "@/components/ui/checkbox";
import { TestResult } from "@/types/patient";
import { cn } from "@/lib/utils";

const testOrderSchema = z.object({
  testName: z.string().min(2, "Test name must be at least 2 characters"),
  category: z.enum(["BLOOD", "URINE", "IMAGING", "BIOPSY", "OTHER"]),
  date: z.date({
    message: "Date is required",
  }),
  orderedBy: z.string().min(2, "Ordering doctor must be at least 2 characters"),
  notes: z.string().optional(),
  priority: z.enum(["ROUTINE", "URGENT", "STAT"]).default("ROUTINE"),
  fastingRequired: z.boolean().default(false),
  specialInstructions: z.string().optional(),
});

type TestOrderFormData = z.infer<typeof testOrderSchema>;

interface TestOrderFormProps {
  test?: TestResult;
  patientId: string;
  onSubmit: (data: TestOrderFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TestOrderForm({
  test,
  patientId,
  onSubmit,
  onCancel,
  isLoading,
}: TestOrderFormProps) {
  const form = useForm<TestOrderFormData>({
    resolver: zodResolver(testOrderSchema),
    defaultValues: {
      testName: test?.testName || "",
      category: test?.category || "BLOOD",
      date: test ? new Date(test.date) : new Date(),
      orderedBy: test?.orderedBy || "",
      notes: test?.notes || "",
      priority: "ROUTINE",
      fastingRequired: false,
      specialInstructions: "",
    },
  });

  // Common tests by category
  const testsByCategory = {
    BLOOD: [
      "Complete Blood Count (CBC)",
      "Basic Metabolic Panel (BMP)",
      "Comprehensive Metabolic Panel (CMP)",
      "Lipid Panel",
      "Thyroid Function Tests",
      "Liver Function Tests",
      "HbA1c",
      "Glucose",
      "Hemoglobin",
      "Platelet Count",
      "PT/PTT",
      "ESR",
      "CRP",
      "Vitamin D",
      "B12",
      "Iron Studies"
    ],
    URINE: [
      "Urinalysis",
      "Urine Culture",
      "24-hour Urine Collection",
      "Urine Protein",
      "Microalbumin",
      "Drug Screen",
      "Pregnancy Test"
    ],
    IMAGING: [
      "Chest X-ray",
      "Abdominal X-ray",
      "CT Scan - Head",
      "CT Scan - Chest",
      "CT Scan - Abdomen/Pelvis",
      "MRI - Brain",
      "MRI - Spine",
      "Ultrasound - Abdominal",
      "Ultrasound - Pelvic",
      "Echocardiogram",
      "EKG",
      "Mammogram",
      "Bone Density Scan"
    ],
    BIOPSY: [
      "Skin Biopsy",
      "Breast Biopsy",
      "Prostate Biopsy",
      "Liver Biopsy",
      "Kidney Biopsy",
      "Bone Marrow Biopsy"
    ],
    OTHER: [
      "Pulmonary Function Test",
      "Stress Test",
      "Colonoscopy",
      "Endoscopy",
      "Holter Monitor",
      "Sleep Study"
    ]
  };

  const selectedCategory = form.watch("category");
  const availableTests = testsByCategory[selectedCategory] || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Category and Test Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BLOOD">Blood Tests</SelectItem>
                    <SelectItem value="URINE">Urine Tests</SelectItem>
                    <SelectItem value="IMAGING">Imaging</SelectItem>
                    <SelectItem value="BIOPSY">Biopsy</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="testName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Name</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTests.map((test) => (
                      <SelectItem key={test} value={test}>
                        {test}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Scheduled Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
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
                      disabled={(date) => date < new Date()}
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
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ROUTINE">Routine</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="STAT">STAT (Immediate)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ordering Doctor */}
        <FormField
          control={form.control}
          name="orderedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordered By</FormLabel>
              <FormControl>
                <Input placeholder="Enter ordering physician name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fasting Required */}
        <FormField
          control={form.control}
          name="fastingRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Fasting Required
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Patient must fast for 8-12 hours before the test
                </div>
              </div>
            </FormItem>
          )}
        />

        {/* Special Instructions */}
        <FormField
          control={form.control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special preparation or instructions for the patient..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Clinical Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinical Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Reason for test, clinical indication, or other notes..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Common Preparation Instructions */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Common Preparation Requirements</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div><strong>Blood Tests:</strong> May require fasting for 8-12 hours</div>
            <div><strong>Urine Tests:</strong> First morning sample often preferred</div>
            <div><strong>Imaging:</strong> May require contrast preparation or medication adjustments</div>
            <div><strong>Biopsy:</strong> May require stopping blood thinners</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? "Ordering..."
              : test
              ? "Update Test Order"
              : "Order Test"}
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
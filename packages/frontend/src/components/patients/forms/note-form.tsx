"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, FileText, User, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PatientNote } from "@/types/patient";

const noteSchema = z.object({
  type: z.enum(["CLINICAL", "ADMINISTRATIVE", "PERSONAL"]),
  content: z.string().min(5, "Note content must be at least 5 characters"),
  isPrivate: z.boolean().default(false),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  note?: PatientNote;
  patientId: string;
  onSubmit: (data: NoteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function NoteForm({
  note,
  patientId,
  onSubmit,
  onCancel,
  isLoading,
}: NoteFormProps) {
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      type: note?.type || "CLINICAL",
      content: note?.content || "",
      isPrivate: note?.isPrivate || false,
    },
  });

  const noteType = form.watch("type");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CLINICAL":
        return <FileText className="h-4 w-4" />;
      case "ADMINISTRATIVE":
        return <User className="h-4 w-4" />;
      case "PERSONAL":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "CLINICAL":
        return "Medical observations, treatment notes, clinical findings";
      case "ADMINISTRATIVE":
        return "Insurance, scheduling, billing, and administrative matters";
      case "PERSONAL":
        return "Personal observations, patient preferences, family notes";
      default:
        return "";
    }
  };

  // Common note templates
  const templates = {
    CLINICAL: [
      "Patient reports feeling better since last visit.",
      "No adverse reactions to current medications.",
      "Vital signs stable and within normal limits.",
      "Patient compliant with treatment plan.",
      "Symptoms have improved significantly.",
      "Follow-up recommended in 2 weeks.",
    ],
    ADMINISTRATIVE: [
      "Insurance verified and updated in system.",
      "Patient arrived 15 minutes early for appointment.",
      "Referral sent to specialist.",
      "Lab results reviewed with patient.",
      "Next appointment scheduled.",
      "Patient education materials provided.",
    ],
    PERSONAL: [
      "Patient prefers morning appointments.",
      "Family member present during consultation.",
      "Patient has transportation concerns.",
      "Language barrier - interpreter needed.",
      "Patient anxious about procedures.",
      "Prefers written instructions.",
    ],
  };

  const currentTemplates = templates[noteType as keyof typeof templates] || [];

  const insertTemplate = (template: string) => {
    const currentContent = form.getValues("content");
    const newContent = currentContent
      ? `${currentContent}\n\n${template}`
      : template;
    form.setValue("content", newContent);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Note Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select note type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CLINICAL">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Clinical</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMINISTRATIVE">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Administrative</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PERSONAL">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Personal</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                {getTypeDescription(noteType)}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Enter ${noteType.toLowerCase()} note...`}
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quick Templates */}
        {currentTemplates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Templates</h4>
            <div className="grid grid-cols-1 gap-2">
              {currentTemplates.map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-left text-xs justify-start"
                  onClick={() => insertTemplate(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Private Note Toggle */}
        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Private Note
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Only authorized staff can view this note
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

        {/* Note Guidelines */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Note Guidelines</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              • <strong>Clinical:</strong> Medical observations, symptoms,
              treatment responses
            </div>
            <div>
              • <strong>Administrative:</strong> Scheduling, insurance, billing,
              referrals
            </div>
            <div>
              • <strong>Personal:</strong> Patient preferences, family dynamics,
              social factors
            </div>
            <div>• Use private notes for sensitive information</div>
            <div>• Be objective and professional in all notes</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Saving..." : note ? "Update Note" : "Add Note"}
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

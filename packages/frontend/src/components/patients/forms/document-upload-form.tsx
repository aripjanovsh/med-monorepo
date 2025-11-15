"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, X, FileText, Image, File } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { MedicalDocument } from "@/types/patient";

const documentUploadSchema = z.object({
  name: z.string().min(2, "Document name must be at least 2 characters"),
  type: z.enum(["REPORT", "IMAGE", "PRESCRIPTION", "REFERRAL", "OTHER"]),
  description: z.string().optional(),
  files: z.array(z.any()).min(1, "At least one file is required"),
});

type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

interface DocumentUploadFormProps {
  document?: MedicalDocument;
  patientId: string;
  onSubmit: (data: DocumentUploadFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DocumentUploadForm({
  document,
  patientId,
  onSubmit,
  onCancel,
  isLoading,
}: DocumentUploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      name: document?.name || "",
      type: document?.type || "REPORT",
      description: document?.description || "",
      files: [],
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files: File[]) => {
    // Filter allowed file types
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      form.setValue("files", newFiles);

      // Auto-fill name if empty and only one file
      if (!form.getValues("name") && newFiles.length === 1) {
        form.setValue("name", newFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue("files", newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Document Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="REPORT">Medical Report</SelectItem>
                  <SelectItem value="IMAGE">Medical Image</SelectItem>
                  <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                  <SelectItem value="REFERRAL">Referral</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Document Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter document name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the document..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload Area */}
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Files</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    />

                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Upload Documents
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOC, DOCX, JPG, PNG, GIF, TXT files up to
                      10MB
                    </p>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Uploaded Files:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file)}
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Requirements */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">File Requirements</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT</div>
            <div>• Maximum file size: 10MB per file</div>
            <div>• Multiple files can be uploaded at once</div>
            <div>• All files will be securely stored and encrypted</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || uploadedFiles.length === 0}
            className="flex-1"
          >
            {isLoading
              ? "Uploading..."
              : document
                ? "Update Document"
                : "Upload Document"}
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

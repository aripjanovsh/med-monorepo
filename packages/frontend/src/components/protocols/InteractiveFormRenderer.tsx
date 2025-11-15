"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface InteractiveFormRendererProps {
  content: any;
  onFormDataChange: (data: Record<string, any>) => void;
}

export default function InteractiveFormRenderer({
  content,
  onFormDataChange,
}: InteractiveFormRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    onFormDataChange(formValues);
  }, [formValues, onFormDataChange]);

  const handleInputChange = (id: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    // Обработка текстовых нод
    if (node.type === "text") {
      return <span key={index}>{node.text}</span>;
    }

    // Обработка параграфов
    if (node.type === "paragraph") {
      return (
        <p key={index} className="mb-4">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </p>
      );
    }

    // Обработка заголовков
    if (node.type === "heading") {
      const Tag = node.tag as keyof JSX.IntrinsicElements;
      return (
        <Tag key={index} className="mb-4 font-bold">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </Tag>
      );
    }

    // Обработка списков
    if (node.type === "list") {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return (
        <Tag key={index} className="mb-4 ml-6 list-disc">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </Tag>
      );
    }

    if (node.type === "listitem") {
      return (
        <li key={index}>
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </li>
      );
    }

    // Обработка кастомных элементов форм
    if (node.type === "text-input" && node.data) {
      const { id, label, placeholder, required, displayMode, width } =
        node.data;
      return (
        <span
          key={index}
          className={
            displayMode === "block" ? "block my-2" : "inline-block mx-1"
          }
        >
          {label && (
            <Label htmlFor={id} className="mr-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          <Input
            id={id}
            type="text"
            placeholder={placeholder}
            value={formValues[id] || ""}
            onChange={(e) => handleInputChange(id, e.target.value)}
            className={displayMode === "inline" ? "inline-flex h-8" : ""}
            style={displayMode === "inline" ? { width: width || "150px" } : {}}
            required={required}
          />
        </span>
      );
    }

    if (node.type === "textarea-input" && node.data) {
      const { id, label, placeholder, required, rows } = node.data;
      return (
        <div key={index} className="my-2">
          {label && (
            <Label htmlFor={id} className="mb-2 block">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          <Textarea
            id={id}
            placeholder={placeholder}
            value={formValues[id] || ""}
            onChange={(e) => handleInputChange(id, e.target.value)}
            rows={rows || 4}
            required={required}
          />
        </div>
      );
    }

    if (node.type === "select-input" && node.data) {
      const { id, label, placeholder, required, options, displayMode, width } =
        node.data;
      return (
        <span
          key={index}
          className={
            displayMode === "block" ? "block my-2" : "inline-block mx-1"
          }
        >
          {label && (
            <Label htmlFor={id} className="mr-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          <Select
            value={formValues[id] || ""}
            onValueChange={(value) => handleInputChange(id, value)}
          >
            <SelectTrigger
              className={displayMode === "inline" ? "inline-flex h-8" : ""}
              style={
                displayMode === "inline" ? { width: width || "150px" } : {}
              }
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      );
    }

    if (node.type === "radio-input" && node.data) {
      const { id, label, required, options } = node.data;
      return (
        <div key={index} className="my-2">
          {label && (
            <Label className="mb-2 block">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          <RadioGroup
            value={formValues[id] || ""}
            onValueChange={(value) => handleInputChange(id, value)}
          >
            {options?.map((option: any) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 mb-1"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`${id}-${option.value}`}
                />
                <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    if (node.type === "checkbox-input" && node.data) {
      const { id, label, placeholder, required, options, displayMode } =
        node.data;

      if (options && options.length > 0) {
        return (
          <div key={index} className="my-2">
            {label && (
              <Label className="mb-2 block">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            <div className="space-y-2">
              {options.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${option.value}`}
                    checked={formValues[id]?.includes(option.value) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = formValues[id] || [];
                      if (checked) {
                        handleInputChange(id, [...currentValues, option.value]);
                      } else {
                        handleInputChange(
                          id,
                          currentValues.filter(
                            (v: string) => v !== option.value,
                          ),
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${id}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <span
          key={index}
          className={
            displayMode === "block" ? "block my-2" : "inline-block mx-1"
          }
        >
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={formValues[id] || false}
              onCheckedChange={(checked) => handleInputChange(id, checked)}
            />
            <Label htmlFor={id}>
              {label || placeholder}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        </span>
      );
    }

    // Обработка корневого элемента
    if (node.type === "root") {
      return (
        <div key={index}>
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </div>
      );
    }

    // Если тип не распознан, пытаемся отрендерить детей
    if (node.children) {
      return (
        <div key={index}>
          {node.children.map((child: any, i: number) => renderNode(child, i))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {renderNode(content.root || content, 0)}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, GripVertical } from "lucide-react";
import type { FormField } from "../../types/form-builder.types";
import { cn } from "@/lib/utils";

type FieldPreviewProps = {
  field: FormField;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
};

export const FieldPreview = ({
  field,
  onEdit,
  onDelete,
  isDragging = false,
}: FieldPreviewProps) => {
  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder}
            disabled
            className="bg-muted"
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled
            className="bg-muted"
            rows={3}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            disabled
            className="bg-muted"
          />
        );

      case "date":
        return (
          <Input
            type="date"
            placeholder={field.placeholder}
            disabled
            className="bg-muted"
          />
        );

      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="bg-muted">
              <SelectValue
                placeholder={field.placeholder ?? "Выберите значение"}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup disabled className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              disabled
              defaultChecked={field.defaultValue as boolean}
            />
            <Label htmlFor={field.id} className="text-sm text-muted-foreground">
              {field.placeholder ?? "Отметьте если применимо"}
            </Label>
          </div>
        );

      case "tags":
        return (
          <div className="flex flex-wrap gap-2">
            {field.options?.map((option, index) => (
              <Badge key={index} variant="outline" className="cursor-default">
                {option}
              </Badge>
            ))}
          </div>
        );

      default:
        return <div className="text-muted-foreground">Неизвестный тип поля</div>;
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm",
        isDragging && "opacity-50",
        field.width && `flex-[0_0_${field.width}%]`
      )}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
          type="button"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Field Content */}
      <div className="space-y-2 pr-16 pl-6">
        <div className="flex items-center gap-2">
          <Label className="font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.readonly && (
            <Badge variant="secondary" className="text-xs">
              Только чтение
            </Badge>
          )}
        </div>
        <div className="pointer-events-none">{renderFieldInput()}</div>

        {/* Field Info */}
        <div className="flex gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {field.type}
          </Badge>
          {field.width && field.width !== 100 && (
            <Badge variant="outline" className="text-xs">
              {field.width}%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

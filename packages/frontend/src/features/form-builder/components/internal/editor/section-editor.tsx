import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";
import type {
  FormField,
  FormSection,
  FieldType,
} from "../../../types/form-builder.types";
import {
  FIELD_CONFIGS,
  createNewField,
} from "../../../utils/form-builder.helpers";
import { FieldPreview } from "../shared/field-preview";
import { FieldEditor } from "./field-editor";
import { cn } from "@/lib/utils";

type SectionEditorProps = {
  section: FormSection;
  onUpdate: (updates: Partial<FormSection>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export const SectionEditor = ({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SectionEditorProps) => {
  // Auto-open edit mode for new sections
  const isNewSection =
    section.title === "Новая секция" && section.fields.length === 0;
  const [isEditingTitle, setIsEditingTitle] = useState(isNewSection);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [editedDescription, setEditedDescription] = useState(
    section.description ?? ""
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
    null
  );
  const [isFieldEditorOpen, setIsFieldEditorOpen] = useState(false);
  const [isNewField, setIsNewField] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const fieldSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdate({
        title: editedTitle,
        description: editedDescription || undefined,
      });
      setIsEditingTitle(false);
    } else if (isNewSection) {
      // If new section and no title provided, delete it
      onDelete();
    } else {
      // Restore original title if empty
      setEditedTitle(section.title);
      setEditedDescription(section.description ?? "");
      setIsEditingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    if (isNewSection && !editedTitle.trim()) {
      // Delete new section if user cancels without entering title
      onDelete();
    } else {
      // Restore original values
      setEditedTitle(section.title);
      setEditedDescription(section.description ?? "");
      setIsEditingTitle(false);
    }
  };

  const handleAddField = (type: FieldType) => {
    const newField = createNewField(type);
    const newFields = [...section.fields, newField];

    // Set the new field as selected and open editor
    setSelectedField(newField);
    setSelectedFieldIndex(newFields.length - 1);
    setIsFieldEditorOpen(true);
    setIsNewField(true);

    // Update the section with the new field
    onUpdate({
      fields: newFields,
    });
  };

  const handleEditField = (field: FormField, index: number) => {
    setSelectedField(field);
    setSelectedFieldIndex(index);
    setIsFieldEditorOpen(true);
    setIsNewField(false);
  };

  const handleSaveField = (updatedField: FormField) => {
    if (selectedFieldIndex !== null) {
      const newFields = [...section.fields];
      newFields[selectedFieldIndex] = updatedField;
      onUpdate({ fields: newFields });
    }
    // Close the editor and reset state
    setIsFieldEditorOpen(false);
    setSelectedField(null);
    setSelectedFieldIndex(null);
    setIsNewField(false);
  };

  const handleCloseFieldEditor = () => {
    // If it's a new field and user cancelled, remove it
    if (isNewField && selectedFieldIndex !== null) {
      const newFields = section.fields.filter(
        (_, i) => i !== selectedFieldIndex
      );
      onUpdate({ fields: newFields });
    }

    setIsFieldEditorOpen(false);
    setSelectedField(null);
    setSelectedFieldIndex(null);
    setIsNewField(false);
  };

  const handleDeleteField = (index: number) => {
    const newFields = section.fields.filter((_, i) => i !== index);
    onUpdate({ fields: newFields });
  };

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = section.fields.findIndex((f) => f.id === active.id);
      const newIndex = section.fields.findIndex((f) => f.id === over.id);

      const reorderedFields = arrayMove(section.fields, oldIndex, newIndex);
      onUpdate({ fields: reorderedFields });
    }
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "transition-all hover:shadow-md",
          isDragging && "opacity-50"
        )}
      >
        <CardHeader>
          <div className="flex items-start gap-2">
            <div
              className="cursor-grab active:cursor-grabbing mt-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              {isEditingTitle ? (
                <>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveTitle();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                    placeholder="Название секции"
                    className="font-semibold text-lg"
                  />
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelEdit();
                      }
                    }}
                    placeholder="Описание секции (необязательно)"
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Отмена
                    </Button>
                    <Button size="sm" onClick={handleSaveTitle}>
                      Сохранить
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsEditingTitle(true)}
                      type="button"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                type="button"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" type="button">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Действия</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
                    Переместить вверх
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onMoveDown}
                    disabled={!canMoveDown}
                  >
                    Переместить вниз
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить секцию
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-4">
            {/* Fields */}
            {section.fields.length > 0 ? (
              <DndContext
                sensors={fieldSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleFieldDragEnd}
              >
                <SortableContext
                  items={section.fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {section.fields.map((field, index) => (
                      <FieldPreview
                        key={field.id}
                        field={field}
                        onEdit={() => handleEditField(field, index)}
                        onDelete={() => handleDeleteField(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Нет полей в этой секции</p>
                <p className="text-sm">Добавьте поле используя кнопку ниже</p>
              </div>
            )}

            {/* Add Field Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full" type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить поле
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Выберите тип поля</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(FIELD_CONFIGS).map((config) => (
                  <DropdownMenuItem
                    key={config.type}
                    onClick={() => handleAddField(config.type)}
                  >
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        )}
      </Card>

      {/* Field Editor */}
      <FieldEditor
        field={selectedField}
        isOpen={isFieldEditorOpen}
        onClose={handleCloseFieldEditor}
        onSave={handleSaveField}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить секцию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить секцию "{section.title}"? Все поля
              в этой секции также будут удалены. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

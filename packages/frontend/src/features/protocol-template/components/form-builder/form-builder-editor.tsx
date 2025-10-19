import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Eye, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { FormBuilderContent, FormSection } from "../../types/form-builder.types";
import {
  createNewSection,
  createEmptyFormBuilderContent,
  validateFormBuilderContent,
  updateSection,
  deleteSection,
  moveSectionInContent,
  deserializeFormBuilderContent,
  serializeFormBuilderContent,
} from "../../utils/form-builder-helpers";
import { SectionEditor } from "./section-editor";
import { toast } from "sonner";

type FormBuilderEditorProps = {
  initialContent?: string;
  onChange: (content: string) => void;
};

export const FormBuilderEditor = ({
  initialContent,
  onChange,
}: FormBuilderEditorProps) => {
  const [content, setContent] = useState<FormBuilderContent>(() => {
    if (initialContent) {
      try {
        const parsed = deserializeFormBuilderContent(initialContent);
        return parsed;
      } catch {
        return createEmptyFormBuilderContent();
      }
    }
    return createEmptyFormBuilderContent();
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const serialized = serializeFormBuilderContent(content);
    onChange(serialized);

    const validation = validateFormBuilderContent(content);
    setValidationErrors(validation.errors);
  }, [content]); // Removed onChange from dependencies to prevent infinite loop

  const handleAddSection = () => {
    const newSection = createNewSection();
    setContent({
      ...content,
      sections: [...content.sections, newSection],
    });
    toast.success("Секция добавлена");
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setContent(updateSection(content, sectionId, updates));
  };

  const handleDeleteSection = (sectionId: string) => {
    setContent(deleteSection(content, sectionId));
    toast.success("Секция удалена");
  };

  const handleMoveSection = (fromIndex: number, toIndex: number) => {
    setContent(moveSectionInContent(content, fromIndex, toIndex));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = content.sections.findIndex((s) => s.id === active.id);
      const newIndex = content.sections.findIndex((s) => s.id === over.id);

      setContent({
        ...content,
        sections: arrayMove(content.sections, oldIndex, newIndex),
      });
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div>
          <h3 className="font-semibold">Конструктор формы</h3>
          <p className="text-sm text-muted-foreground">
            Создайте структуру медицинской формы с секциями и полями
          </p>
        </div>
        <Button onClick={handleAddSection} type="button">
          <Plus className="h-4 w-4 mr-2" />
          Добавить секцию
        </Button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 border-b">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Ошибки валидации:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {content.sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-lg mb-2">Начните создание формы</h4>
            <p className="text-muted-foreground mb-4 max-w-md">
              Добавьте первую секцию для вашего протокола. Секции помогают
              организовать форму по логическим блокам.
            </p>
            <Button onClick={handleAddSection} type="button">
              <Plus className="h-4 w-4 mr-2" />
              Добавить первую секцию
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={content.sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {content.sections.map((section, index) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    onUpdate={(updates) => handleUpdateSection(section.id, updates)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onMoveUp={
                      index > 0
                        ? () => handleMoveSection(index, index - 1)
                        : undefined
                    }
                    onMoveDown={
                      index < content.sections.length - 1
                        ? () => handleMoveSection(index, index + 1)
                        : undefined
                    }
                    canMoveUp={index > 0}
                    canMoveDown={index < content.sections.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </ScrollArea>

      {/* Footer Stats */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/30">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{content.sections.length}</span> секций,{" "}
          <span className="font-medium">
            {content.sections.reduce((sum, s) => sum + s.fields.length, 0)}
          </span>{" "}
          полей
        </div>
        <div className="flex items-center gap-2">
          {validationErrors.length === 0 ? (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Готово к сохранению
            </span>
          ) : (
            <span className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.length} ошибок
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

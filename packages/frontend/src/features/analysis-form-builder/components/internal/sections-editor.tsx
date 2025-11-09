"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AnalysisSection } from "../../types/analysis-form.types";
import { createNewSection } from "../../utils/analysis-form.helpers";
import { ParametersEditorTable } from "./parameters-editor-table";

type SectionsEditorProps = {
  sections: AnalysisSection[];
  onSectionsChange: (sections: AnalysisSection[]) => void;
};

export const SectionsEditor = ({
  sections,
  onSectionsChange,
}: SectionsEditorProps) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );

  const addSection = () => {
    const newSection = createNewSection();
    const updated = [...sections, newSection];
    onSectionsChange(updated);
    setOpenSections(new Set([...openSections, newSection.id]));
  };

  const removeSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
    const updated = new Set(openSections);
    updated.delete(id);
    setOpenSections(updated);
  };

  const updateSection = (
    id: string,
    field: keyof AnalysisSection,
    value: unknown
  ) => {
    onSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const toggleSection = (id: string) => {
    const updated = new Set(openSections);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setOpenSections(updated);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onSectionsChange(updated);
  };

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Нет секций. Добавьте секцию для группировки параметров анализа.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить первую секцию
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        sections.map((section, index) => (
          <Card key={section.id}>
            <Collapsible
              open={openSections.has(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-move"
                      title="Перетащить"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-2 p-0 h-auto font-semibold"
                        >
                          {openSections.has(section.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span>
                            {section.title || `Секция ${index + 1}`}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal">
                            ({section.parameters.length} параметров)
                          </span>
                        </Button>
                      </CollapsibleTrigger>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSection(index, "up")}
                          disabled={index === 0}
                          title="Переместить вверх"
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSection(index, "down")}
                          disabled={index === sections.length - 1}
                          title="Переместить вниз"
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                          title="Удалить секцию"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`section-title-${section.id}`}>
                          Название секции *
                        </Label>
                        <Input
                          id={`section-title-${section.id}`}
                          value={section.title}
                          onChange={(e) =>
                            updateSection(section.id, "title", e.target.value)
                          }
                          placeholder="Например: Общие показатели"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`section-desc-${section.id}`}>
                          Описание (опционально)
                        </Label>
                        <Input
                          id={`section-desc-${section.id}`}
                          value={section.description || ""}
                          onChange={(e) =>
                            updateSection(
                              section.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Краткое описание секции"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent>
                  <ParametersEditorTable
                    parameters={section.parameters}
                    onParametersChange={(params) =>
                      updateSection(section.id, "parameters", params)
                    }
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))
      )}

      {sections.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={addSection}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить секцию
        </Button>
      )}
    </div>
  );
};

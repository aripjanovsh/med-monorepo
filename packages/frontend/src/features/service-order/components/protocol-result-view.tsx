"use client";

import { FormBuilderView } from "@/features/form-builder";
import type { SavedProtocolData } from "@/features/visit/visit-protocol.types";

interface ProtocolResultViewProps {
  data: SavedProtocolData;
}

export const ProtocolResultView = ({ data }: ProtocolResultViewProps) => {
  const { templateName, templateContent, filledData } = data;

  if (!filledData || Object.keys(filledData).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Данные протокола отсутствуют
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{templateName}</h3>
        <p className="text-sm text-muted-foreground">Результаты протокола</p>
      </div>

      <FormBuilderView
        templateJson={templateContent}
        data={filledData}
        compact={false}
      />
    </div>
  );
};

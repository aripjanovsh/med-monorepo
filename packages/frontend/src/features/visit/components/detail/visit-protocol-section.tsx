"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitProtocol } from "@/features/visit";
import type { VisitResponseDto } from "../../visit.dto";
import type { SavedProtocolData } from "../../visit-protocol.types";

type VisitProtocolSectionProps = {
  visit: VisitResponseDto;
  externalProtocolData?: SavedProtocolData | null;
  onExternalProtocolApplied?: () => void;
};

export const VisitProtocolSection = ({
  visit,
  externalProtocolData,
  onExternalProtocolApplied,
}: VisitProtocolSectionProps) => {
  if (!visit.patient) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Протокол осмотра</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <VisitProtocol
          visitId={visit.id}
          patientId={visit.patient.id}
          initialProtocolId={visit.protocol?.id}
          initialProtocolData={
            visit.protocolData
              ? (JSON.parse(visit.protocolData) as SavedProtocolData)
              : null
          }
          status={visit.status}
          externalProtocolData={externalProtocolData}
          onExternalProtocolApplied={onExternalProtocolApplied}
        />
      </CardContent>
    </Card>
  );
};

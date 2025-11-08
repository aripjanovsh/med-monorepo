import type { ReactElement } from "react";
import { getAllergySeverityLabel } from "@/features/patient-allergy";
import type { PatientAllergy } from "@/features/patient-allergy";

type AllergyListItemProps = {
  allergy: PatientAllergy;
};

export const AllergyListItem = ({
  allergy,
}: AllergyListItemProps): ReactElement => {
  return (
    <div className="border-b pb-3 last:border-0">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="font-medium text-sm">{allergy.substance}</p>
          {allergy.reaction && (
            <p className="text-xs text-muted-foreground">{allergy.reaction}</p>
          )}
          {allergy.severity && (
            <p className="text-xs">
              Степень: {getAllergySeverityLabel(allergy.severity)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

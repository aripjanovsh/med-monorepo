"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { TimePickerField } from "@/components/fields/time-picker-field";
import { Label } from "@/components/ui/label";
import { WorkScheduleDto } from "../employee.dto";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Shape that will be emitted as WorkScheduleDto object
// { monday: { from: "08:00", to: "18:00" }, tuesday: null, ... }

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "monday", label: "Понедельник", short: "Пн" },
  { key: "tuesday", label: "Вторник", short: "Вт" },
  { key: "wednesday", label: "Среда", short: "Ср" },
  { key: "thursday", label: "Четверг", short: "Чт" },
  { key: "friday", label: "Пятница", short: "Пт" },
  { key: "saturday", label: "Суббота", short: "Сб" },
  { key: "sunday", label: "Воскресенье", short: "Вс" },
];

export interface WorkScheduleFieldProps {
  value?: WorkScheduleDto; // WorkSchedule object
  onChange: (schedule: WorkScheduleDto | undefined) => void;
  className?: string;
}

interface DayState {
  active: boolean;
  from: string; // HH:MM
  to: string; // HH:MM
}

function parseInitialState(value?: WorkScheduleDto): Record<DayKey, DayState> {
  const base: Record<DayKey, DayState> = {
    monday: { active: false, from: "09:00", to: "18:00" },
    tuesday: { active: false, from: "09:00", to: "18:00" },
    wednesday: { active: false, from: "09:00", to: "18:00" },
    thursday: { active: false, from: "09:00", to: "18:00" },
    friday: { active: false, from: "09:00", to: "18:00" },
    saturday: { active: false, from: "09:00", to: "18:00" },
    sunday: { active: false, from: "09:00", to: "18:00" },
  };

  if (!value) return base;

  for (const d of DAYS) {
    const daySchedule = value[d.key];
    if (daySchedule && daySchedule.from && daySchedule.to) {
      base[d.key] = {
        active: true,
        from: daySchedule.from,
        to: daySchedule.to,
      };
    }
  }

  return base;
}

function buildScheduleObject(state: Record<DayKey, DayState>): WorkScheduleDto {
  const out: WorkScheduleDto = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  };

  for (const d of DAYS) {
    const s = state[d.key];
    if (s.active && s.from && s.to) {
      out[d.key] = { from: s.from, to: s.to };
    }
  }

  return out;
}

export const WorkScheduleField: React.FC<WorkScheduleFieldProps> = ({
  value,
  onChange,
  className,
}) => {
  const [state, setState] = React.useState<Record<DayKey, DayState>>(() =>
    parseInitialState(value)
  );

  // Keep internal state in sync when value prop changes externally
  React.useEffect(() => {
    setState(parseInitialState(value));
  }, [value]);

  const handleToggle = (key: DayKey, active: boolean | "indeterminate") => {
    const next = { ...state, [key]: { ...state[key], active: !!active } };
    setState(next);
    onChange(buildScheduleObject(next));
  };

  const handleTimeChange = (
    key: DayKey,
    field: "from" | "to",
    time: string
  ) => {
    const next = { ...state, [key]: { ...state[key], [field]: time } };
    setState(next);
    onChange(buildScheduleObject(next));
  };

  const selectAllWeekdays = () => {
    const next = { ...state };
    for (const d of DAYS.slice(0, 5)) {
      next[d.key] = { ...next[d.key], active: true };
    }
    setState(next);
    onChange(buildScheduleObject(next));
  };

  const clearAll = () => {
    const next = { ...state };
    for (const d of DAYS) {
      next[d.key] = { ...next[d.key], active: false };
    }
    setState(next);
    onChange(buildScheduleObject(next));
  };

  const copyToAll = (sourceKey: DayKey) => {
    const sourceDay = state[sourceKey];
    if (!sourceDay.active) return;

    const { from, to } = sourceDay;
    const next = { ...state };

    for (const d of DAYS) {
      if (d.key !== sourceKey && next[d.key].active) {
        next[d.key] = { ...next[d.key], from, to };
      }
    }
    setState(next);
    onChange(buildScheduleObject(next));
  };

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-2">
        <ButtonGroup>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={selectAllWeekdays}
          >
            Выбрать Пн–Пт
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={clearAll}>
            Очистить
          </Button>
        </ButtonGroup>
      </div>

      <div className="space-y-2">
        {DAYS.map((d) => {
          const day = state[d.key];
          return (
            <div
              key={d.key}
              className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 rounded-md border p-3"
            >
              <div className="sm:col-span-4 flex items-center gap-3">
                <Switch
                  checked={day.active}
                  onCheckedChange={(v) => handleToggle(d.key, v)}
                  id={`ws-${d.key}`}
                />
                <Label
                  htmlFor={`ws-${d.key}`}
                  className="cursor-pointer font-medium"
                >
                  {d.label}
                </Label>
              </div>

              <div className="sm:col-span-8 flex items-center justify-center gap-3 min-h-9">
                {day.active ? (
                  <>
                    <TimePickerField
                      value={day.from}
                      onChange={(val) =>
                        handleTimeChange(d.key, "from", val || "")
                      }
                      disabled={!day.active}
                      className="w-full"
                    />

                    <div className="text-sm text-muted-foreground min-w-[50px] text-center">
                      до
                    </div>

                    <TimePickerField
                      value={day.to}
                      onChange={(val) =>
                        handleTimeChange(d.key, "to", val || "")
                      }
                      disabled={!day.active}
                      className="w-full"
                    />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToAll(d.key)}
                        >
                          <Zap />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Применить ко всем</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    Не рабочий день
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkScheduleField;

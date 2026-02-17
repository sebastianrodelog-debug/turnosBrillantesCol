import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
  breaks: { start: string; end: string }[];
}

type WeekSchedule = Record<string, DaySchedule>;

const days = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const defaultSchedule: WeekSchedule = {
  monday: { enabled: true, start: "09:00", end: "18:00", breaks: [] },
  tuesday: { enabled: true, start: "09:00", end: "18:00", breaks: [] },
  wednesday: { enabled: true, start: "09:00", end: "18:00", breaks: [] },
  thursday: { enabled: true, start: "09:00", end: "18:00", breaks: [] },
  friday: { enabled: true, start: "09:00", end: "18:00", breaks: [] },
  saturday: { enabled: true, start: "09:00", end: "14:00", breaks: [] },
  sunday: { enabled: false, start: "09:00", end: "14:00", breaks: [] },
};

export function ScheduleManager() {
  const [schedule, setSchedule] = useState<WeekSchedule>(defaultSchedule);

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateTime = (day: string, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const addBreak = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...prev[day].breaks, { start: "12:00", end: "13:00" }],
      },
    }));
  };

  const removeBreak = (day: string, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">Horarios</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Configura tus horarios de atención</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {days.map(({ key, label }) => (
          <div
            key={key}
            className={cn(
              "bg-card rounded-xl p-3 sm:p-4 border border-border transition-opacity animate-fade-in",
              !schedule[key].enabled && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Switch
                  checked={schedule[key].enabled}
                  onCheckedChange={() => toggleDay(key)}
                />
                <span className="text-sm sm:text-base font-medium text-foreground">{label}</span>
              </div>
              {schedule[key].enabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addBreak(key)}
                  className="gap-1 text-muted-foreground"
                >
                  <Plus className="w-4 h-4" />
                  Descanso
                </Button>
              )}
            </div>

            {schedule[key].enabled && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <Label className="text-xs sm:text-sm text-muted-foreground">Apertura</Label>
                    <Input
                      type="time"
                      value={schedule[key].start}
                      onChange={(e) => updateTime(key, "start", e.target.value)}
                      className="w-24 sm:w-28 h-8 sm:h-10 text-sm"
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">a</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Cierre</Label>
                    <Input
                      type="time"
                      value={schedule[key].end}
                      onChange={(e) => updateTime(key, "end", e.target.value)}
                      className="w-24 sm:w-28 h-8 sm:h-10 text-sm"
                    />
                  </div>
                </div>

                {schedule[key].breaks.map((breakTime, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-6 flex-wrap">
                    <span className="text-xs sm:text-sm text-muted-foreground">Descanso:</span>
                    <Input
                      type="time"
                      value={breakTime.start}
                      onChange={(e) => {
                        const newBreaks = [...schedule[key].breaks];
                        newBreaks[index].start = e.target.value;
                        setSchedule((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], breaks: newBreaks },
                        }));
                      }}
                      className="w-24 sm:w-28 h-8 sm:h-10 text-sm"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">a</span>
                    <Input
                      type="time"
                      value={breakTime.end}
                      onChange={(e) => {
                        const newBreaks = [...schedule[key].breaks];
                        newBreaks[index].end = e.target.value;
                        setSchedule((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], breaks: newBreaks },
                        }));
                      }}
                      className="w-24 sm:w-28 h-8 sm:h-10 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBreak(key, index)}
                      className="text-destructive h-8 w-8"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button className="w-full sm:w-auto">Guardar Horarios</Button>
    </div>
  );
}

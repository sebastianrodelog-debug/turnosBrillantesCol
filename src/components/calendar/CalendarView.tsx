import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Appointment, AppointmentStatus } from "@/types/business";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export function CalendarView({ appointments, onSelectDate, onSelectAppointment }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  // Week view helpers
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Month view helpers
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfMonth = monthStart.getDay();
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter(apt => {
      // Handle "Hoy" and "Mañana" as relative dates
      if (apt.date === "Hoy" && isSameDay(date, new Date())) return true;
      if (apt.date === "Mañana" && isSameDay(date, addDays(new Date(), 1))) return true;
      return apt.date === dateStr;
    });
  };

  const handlePrev = () => {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Time slots for week view
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Calendario</h2>
          <p className="text-muted-foreground">Vista de tus citas</p>
        </div>
        
        <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")}>
          <TabsList>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Hoy
          </Button>
        </div>
        <h3 className="text-lg font-medium text-foreground">
          {view === "week" 
            ? `${format(weekStart, "d MMM", { locale: es })} - ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}`
            : format(currentDate, "MMMM yyyy", { locale: es })
          }
        </h3>
      </div>

      {/* Week View */}
      {view === "week" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-3 text-center text-sm text-muted-foreground border-r border-border">
              Hora
            </div>
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 text-center border-r border-border last:border-r-0",
                  isSameDay(day, new Date()) && "bg-primary/10"
                )}
              >
                <p className="text-xs text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p className={cn(
                  "text-lg font-medium",
                  isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, "d")}
                </p>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="max-h-[500px] overflow-y-auto">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b border-border last:border-b-0">
                <div className="p-2 text-xs text-muted-foreground text-center border-r border-border">
                  {time}
                </div>
                {weekDays.map((day, i) => {
                  const dayAppointments = getAppointmentsForDay(day).filter(
                    apt => apt.time.startsWith(time.split(':')[0])
                  );
                  return (
                    <div
                      key={i}
                      onClick={() => onSelectDate(day)}
                      className={cn(
                        "p-1 min-h-[50px] border-r border-border last:border-r-0 cursor-pointer hover:bg-secondary/50 transition-colors",
                        isSameDay(day, new Date()) && "bg-primary/5"
                      )}
                    >
                      {dayAppointments.map((apt) => (
                        <button
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment(apt);
                          }}
                          className={cn(
                            "w-full text-left text-xs p-1 rounded truncate text-white mb-1",
                            statusColors[apt.status]
                          )}
                        >
                          {apt.time} - {apt.clientName}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month View */}
      {view === "month" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Day names header */}
          <div className="grid grid-cols-7 border-b border-border">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Padding for first week */}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="p-2 min-h-[100px] border-r border-b border-border bg-secondary/20" />
            ))}
            
            {monthDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onSelectDate(day)}
                  className={cn(
                    "p-2 min-h-[100px] border-r border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors",
                    isSameDay(day, new Date()) && "bg-primary/10",
                    !isSameMonth(day, currentDate) && "bg-secondary/30"
                  )}
                >
                  <p className={cn(
                    "text-sm font-medium mb-1",
                    isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </p>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className={cn(
                          "w-full text-left text-xs p-1 rounded truncate text-white",
                          statusColors[apt.status]
                        )}
                      >
                        {apt.time} {apt.clientName}
                      </button>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Cancelado</span>
        </div>
      </div>
    </div>
  );
}

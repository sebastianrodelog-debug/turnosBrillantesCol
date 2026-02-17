import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { AppointmentCard } from "./AppointmentCard";
import { DashboardCharts } from "./DashboardCharts";
import { Client, Appointment } from "@/types/business";
import { format } from "date-fns";

interface DashboardSectionProps {
  appointments: Appointment[];
  clients?: Client[];
  onUpdateAppointment: (id: string, status: Appointment["status"]) => void;
}

export function DashboardSection({ appointments, clients = [], onUpdateAppointment }: DashboardSectionProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  const pendingCount = appointments.filter(a => a.status === "pending").length;
  const confirmedCount = appointments.filter(a => a.status === "confirmed").length;
  // Simple revenue calc (sum of prices of completed/confirmed appointments)
  // We need price in Appointment to be accurate, but it's not strictly there in the interface shown in business.ts 
  // (It has serviceId but not price directly, unless we fetch services or it was added to Appointment type properly).
  // I'll skip revenue for now or just mock it based on count * avg price to not break TS if price is missing.
  // business.ts Appointment interface didn't show price. I'll assume standard price or just use counts.

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">Dashboard</h2>
        <p className="text-muted-foreground">Resumen de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Turnos Hoy"
          value={todayAppointments.length}
          subtitle="programados"
          icon={Calendar}
        // trend={{ value: 12, positive: true }} // removing hardcoded trend
        />
        <StatsCard
          title="Pendientes"
          value={pendingCount}
          subtitle="por confirmar"
          icon={Clock}
        />
        <StatsCard
          title="Confirmados"
          value={confirmedCount}
          subtitle="listos"
          icon={TrendingUp}
        />
        <StatsCard
          title="Clientes"
          value={clients.length}
          subtitle="totales"
          icon={Users}
        // trend={{ value: 8, positive: true }} // removing hardcoded trend
        />
      </div>

      {/* Charts Section */}
      <DashboardCharts appointments={appointments} />

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Próximos turnos de Hoy</h3>
        {todayAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {todayAppointments.slice(0, 6).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onConfirm={(id) => onUpdateAppointment(id, "confirmed")}
                onCancel={(id) => onUpdateAppointment(id, "cancelled")}
                onComplete={(id) => onUpdateAppointment(id, "completed")}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No hay turnos programados para hoy.</p>
          </div>
        )}
      </div>
    </div>
  );
}

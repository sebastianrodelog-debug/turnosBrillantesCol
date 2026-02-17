import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppointmentCard, Appointment } from "@/components/dashboard/AppointmentCard";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentListProps {
  appointments: Appointment[];
  onAddAppointment: (appointment: Omit<Appointment, "id">) => void;
  onUpdateAppointment: (id: string, status: Appointment["status"]) => void;
}

export function AppointmentList({ appointments, onAddAppointment, onUpdateAppointment }: AppointmentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Turnos</h2>
          <p className="text-muted-foreground">Gestiona todos tus turnos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Turno
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-card">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onConfirm={(id) => onUpdateAppointment(id, "confirmed")}
            onCancel={(id) => onUpdateAppointment(id, "cancelled")}
            onComplete={(id) => onUpdateAppointment(id, "completed")}
          />
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron turnos</p>
        </div>
      )}

      <NewAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={onAddAppointment}
      />
    </div>
  );
}

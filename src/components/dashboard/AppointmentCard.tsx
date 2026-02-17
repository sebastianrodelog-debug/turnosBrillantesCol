import { Clock, User, Phone, MoreVertical, Check, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Appointment } from "@/types/business";

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function AppointmentCard({ appointment, onConfirm, onCancel, onComplete }: AppointmentCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{appointment.clientName}</p>
            <p className="text-sm text-muted-foreground">{appointment.service}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            {appointment.status === "pending" && (
              <DropdownMenuItem onClick={() => onConfirm?.(appointment.id)}>
                <Check className="w-4 h-4 mr-2" />
                Confirmar
              </DropdownMenuItem>
            )}
            {appointment.status === "confirmed" && (
              <DropdownMenuItem onClick={() => onComplete?.(appointment.id)}>
                <Check className="w-4 h-4 mr-2" />
                Marcar completado
              </DropdownMenuItem>
            )}
            {(appointment.status === "pending" || appointment.status === "confirmed") && (
              <DropdownMenuItem onClick={() => onCancel?.(appointment.id)} className="text-destructive">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{appointment.time} - {appointment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{appointment.phone}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
          statusStyles[appointment.status]
        )}>
          {statusLabels[appointment.status]}
        </span>

        {/* WhatsApp Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-2 h-8"
          onClick={() => {
            const message = `Hola ${appointment.clientName}!\n\n` +
              `Te confirmamos que tu turno para *${appointment.service}* el dia ${appointment.date} a las ${appointment.time} ha sido registrado.\n\n` +
              `Te esperamos!`;

            const encodedMessage = encodeURIComponent(message);
            const cleanPhone = appointment.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
          }}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="sr-only sm:not-sr-only sm:inline-block">WhatsApp</span>
        </Button>
      </div>
    </div>
  );
}

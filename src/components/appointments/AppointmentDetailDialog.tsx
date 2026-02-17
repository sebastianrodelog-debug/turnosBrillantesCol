import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Scissors, 
  MessageCircle,
  Check,
  X,
  CheckCircle,
  RotateCcw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Appointment, AppointmentStatus } from "@/types/business";
import { cn } from "@/lib/utils";

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <Check className="w-3 h-3" /> },
  completed: { label: "Completado", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <X className="w-3 h-3" /> },
};

export function AppointmentDetailDialog({ 
  appointment, 
  open, 
  onOpenChange,
  onUpdateStatus 
}: AppointmentDetailDialogProps) {
  if (!appointment) return null;

  const config = statusConfig[appointment.status];

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${appointment.clientName}, te recordamos tu turno para ${appointment.service} el ${appointment.date} a las ${appointment.time}.`
    );
    const cleanPhone = appointment.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Detalle del turno
            </DialogTitle>
            <Badge className={cn("gap-1", config.color)}>
              {config.icon}
              {config.label}
            </Badge>
          </div>
          <DialogDescription>
            Información completa de la cita
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{appointment.clientName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {appointment.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Servicio
              </span>
              <span className="text-sm font-medium text-foreground">{appointment.service}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha
              </span>
              <span className="text-sm font-medium text-foreground">{appointment.date}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hora
              </span>
              <span className="text-sm font-medium text-foreground">{appointment.time}</span>
            </div>

            {appointment.employeeName && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profesional
                  </span>
                  <span className="text-sm font-medium text-foreground">{appointment.employeeName}</span>
                </div>
              </>
            )}

            {appointment.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Notas:</span>
                  <p className="text-sm text-foreground mt-1">{appointment.notes}</p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button 
              variant="outline" 
              className="w-full gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-4 h-4" />
              Enviar recordatorio por WhatsApp
            </Button>

            <Separator />

            <div className="grid grid-cols-2 gap-2">
              {appointment.status === "pending" && (
                <>
                  <Button 
                    variant="outline"
                    className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                    onClick={() => {
                      onUpdateStatus(appointment.id, "confirmed");
                      onOpenChange(false);
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Confirmar
                  </Button>
                  <Button 
                    variant="outline"
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => {
                      onUpdateStatus(appointment.id, "cancelled");
                      onOpenChange(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                </>
              )}
              
              {appointment.status === "confirmed" && (
                <>
                  <Button 
                    variant="outline"
                    className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    onClick={() => {
                      onUpdateStatus(appointment.id, "completed");
                      onOpenChange(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Completar
                  </Button>
                  <Button 
                    variant="outline"
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => {
                      onUpdateStatus(appointment.id, "cancelled");
                      onOpenChange(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                </>
              )}

              {(appointment.status === "cancelled" || appointment.status === "completed") && (
                <Button 
                  variant="outline"
                  className="col-span-2 gap-1"
                  onClick={() => {
                    onUpdateStatus(appointment.id, "pending");
                    onOpenChange(false);
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reagendar (volver a pendiente)
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

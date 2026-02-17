import { useState, useMemo } from "react";
import { Search, User, Phone, Calendar, MessageCircle, Plus, History, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Client, Appointment } from "@/types/business";

interface ClientListEnhancedProps {
  clients: Client[];
  appointments: Appointment[];
}

export function ClientListEnhanced({ clients, appointments }: ClientListEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  const getClientAppointments = (clientId: string) => {
    return appointments.filter(apt => apt.clientId === clientId);
  };

  const getClientStats = (clientId: string) => {
    const clientAppts = getClientAppointments(clientId);
    return {
      total: clientAppts.length,
      completed: clientAppts.filter(a => a.status === "completed").length,
      cancelled: clientAppts.filter(a => a.status === "cancelled").length,
      lastVisit: clientAppts.length > 0 
        ? clientAppts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
        : null
    };
  };

  const sendWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hola ${name}, te recordamos tu próximo turno.`);
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Clientes</h2>
          <p className="text-muted-foreground">
            {clients.length} cliente(s) registrado(s)
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Sin clientes</h3>
          <p className="text-muted-foreground">
            Los clientes se agregarán automáticamente cuando agenden turnos
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const stats = getClientStats(client.id);
            return (
              <div
                key={client.id}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {stats.completed} visita(s)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {stats.lastVisit && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Última: {stats.lastVisit}
                      </span>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => setSelectedClient(client)}
                        >
                          <History className="w-4 h-4" />
                          <span className="hidden sm:inline">Historial</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            {client.name}
                          </DialogTitle>
                          <DialogDescription>
                            Historial de citas del cliente
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-secondary/30 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                              <p className="text-xs text-muted-foreground">Completadas</p>
                            </div>
                            <div className="bg-red-500/10 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                              <p className="text-xs text-muted-foreground">Canceladas</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Appointment History */}
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {getClientAppointments(client.id).length === 0 ? (
                              <p className="text-center text-muted-foreground py-4">
                                Sin citas registradas
                              </p>
                            ) : (
                              getClientAppointments(client.id)
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map(apt => (
                                  <div 
                                    key={apt.id}
                                    className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg"
                                  >
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{apt.service}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {apt.date} • {apt.time}
                                      </p>
                                    </div>
                                    <Badge variant={
                                      apt.status === "completed" ? "default" :
                                      apt.status === "cancelled" ? "destructive" :
                                      apt.status === "confirmed" ? "secondary" : "outline"
                                    }>
                                      {apt.status === "pending" && "Pendiente"}
                                      {apt.status === "confirmed" && "Confirmado"}
                                      {apt.status === "completed" && "Completado"}
                                      {apt.status === "cancelled" && "Cancelado"}
                                    </Badge>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendWhatsApp(client.phone, client.name)}
                      className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

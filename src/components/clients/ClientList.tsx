import { useState } from "react";
import { Search, User, Phone, Calendar, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
}

const mockClients: Client[] = [
  { id: "1", name: "Juan Pérez", phone: "+54 9 11 1234-5678", lastVisit: "10 Dic 2024", totalVisits: 12 },
  { id: "2", name: "María García", phone: "+54 9 11 2345-6789", lastVisit: "8 Dic 2024", totalVisits: 8 },
  { id: "3", name: "Carlos López", phone: "+54 9 11 3456-7890", lastVisit: "5 Dic 2024", totalVisits: 5 },
  { id: "4", name: "Ana Martínez", phone: "+54 9 11 4567-8901", lastVisit: "3 Dic 2024", totalVisits: 15 },
  { id: "5", name: "Pedro Rodríguez", phone: "+54 9 11 5678-9012", lastVisit: "1 Dic 2024", totalVisits: 3 },
];

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const sendWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hola ${name}, te recordamos tu próximo turno en TurnoFácil.`);
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">Clientes</h2>
        <p className="text-muted-foreground">Gestiona tu base de clientes</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{client.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {client.totalVisits} visitas
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Última: {client.lastVisit}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendWhatsApp(client.phone, client.name)}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      )}
    </div>
  );
}

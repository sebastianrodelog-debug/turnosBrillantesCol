import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { ScheduleManager } from "@/components/schedule/ScheduleManager";
import { ClientListEnhanced } from "@/components/clients/ClientListEnhanced";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EmployeeManager } from "@/components/employees/EmployeeManager";
import { ShareBookingLink } from "@/components/dashboard/ShareBookingLink";
import { AppointmentDetailDialog } from "@/components/appointments/AppointmentDetailDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { BUSINESS_TYPES, Appointment, Client, AppointmentStatus } from "@/types/business";
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// ... imports

export default function Index() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isBusinessConfigured, business, employee, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (!isBusinessConfigured) {
      navigate('/setup');
    }
  }, [isAuthenticated, isBusinessConfigured, navigate]);

  useEffect(() => {
    if (!business?.id) return;

    // Subscribe to appointments for this business
    const q = query(
      collection(db, "appointments"),
      where("businessId", "==", business.id), // Filter by business
      where("businessId", "==", business.id) // Filter by business
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAppointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(newAppointments);

      // Derive unique clients from appointments
      const uniqueClientsMap = new Map<string, Client>();
      newAppointments.forEach(apt => {
        if (!uniqueClientsMap.has(apt.phone)) {
          uniqueClientsMap.set(apt.phone, {
            id: apt.clientId === 'guest' ? apt.phone : apt.clientId,
            name: apt.clientName,
            phone: apt.phone,
            createdAt: apt.createdAt
          });
        }
      });
      setClients(Array.from(uniqueClientsMap.values()));

    }, (error) => {
      console.error("Error fetching appointments:", error);
      // Handle error silently or show toast once
    });

    return () => unsubscribe();
  }, [business?.id, toast]);

  const handleAddAppointment = (newAppointment: Omit<Appointment, "id">) => {
    // ... logic
  };

  // ... rest of handlers

  const handleUpdateAppointment = async (id: string, status: AppointmentStatus) => {
    // Optimistic update
    setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)));

    try {
      const docRef = doc(db, "appointments", id);
      await updateDoc(docRef, { status });

      // Notification Logic
      if (status === 'confirmed' && business?.notifications?.confirmationMessage) {
        const apt = appointments.find(a => a.id === id);
        if (apt) {
          const message = `Hola ${apt.clientName}!\n\n` +
            `Te confirmamos que tu turno en *${business.name}* ha sido aceptado.\n\n` +
            `Fecha: ${apt.date}\n` +
            `Hora: ${apt.time}\n` +
            `Servicio: ${apt.service}\n\n` +
            `Direccion: ${business.address || 'Consultar'}\n\n` +
            `Te esperamos!`;

          const encodedMessage = encodeURIComponent(message);
          // Use apt.phone (client's phone)
          window.open(`https://wa.me/${apt.phone}?text=${encodedMessage}`, '_blank');
        }
      }

      const statusMessages = { confirmed: "confirmado", cancelled: "cancelado", completed: "completado", pending: "pendiente" };
      toast({ title: `Turno ${statusMessages[status]}`, description: `El estado del turno ha sido actualizado.` });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del turno.",
        variant: "destructive"
      });
      // Revert optimistic update if needed (optional for now as snapshot listener might correct it)
    }
  };

  const handleLogout = () => { logout(); navigate('/auth'); };

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setDetailDialogOpen(true);
  };

  const businessTypeInfo = business?.type ? BUSINESS_TYPES.find(t => t.value === business.type) : null;

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardSection appointments={appointments} clients={clients} onUpdateAppointment={handleUpdateAppointment} />;
      case "appointments": return <AppointmentList appointments={appointments} onAddAppointment={handleAddAppointment} onUpdateAppointment={handleUpdateAppointment} />;
      case "calendar": return <CalendarView appointments={appointments} onSelectDate={() => { }} onSelectAppointment={handleSelectAppointment} />;
      case "schedule": return <ScheduleManager />;
      case "clients": return <ClientListEnhanced clients={clients} appointments={appointments} />;
      case "employees": return <EmployeeManager />;
      case "notifications": return <NotificationSettings />;
      case "settings": return <SettingsPanel />;
      default: return <DashboardSection appointments={appointments} onUpdateAppointment={handleUpdateAppointment} />;
    }
  };

  if (!isAuthenticated || !isBusinessConfigured) return null;

  return (
    <div className="min-h-screen bg-background">
      <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-4 lg:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              {businessTypeInfo && <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">{businessTypeInfo.icon}</div>}
              <div>
                <h1 className="text-lg font-semibold text-foreground">{business?.name || 'Mi Negocio'}</h1>
                <p className="text-sm text-muted-foreground">{businessTypeInfo?.label} • {employee?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShareBookingLink />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
          {renderSection()}
        </main>
      </div>
      <AppointmentDetailDialog appointment={selectedAppointment} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} onUpdateStatus={handleUpdateAppointment} />
      <PWAInstallPrompt />
    </div>
  );
}

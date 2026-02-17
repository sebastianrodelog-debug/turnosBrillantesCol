import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "react-router-dom";
import { Calendar, Clock, User, Phone, CheckCircle, ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BusinessData, BusinessService, BUSINESS_TYPES } from "@/types/business";
import { Helmet } from "react-helmet-async";

type Step = "welcome" | "service" | "datetime" | "details" | "confirmation";

// Generate time slots based on business hours
const generateTimeSlots = (openTime: string, closeTime: string): string[] => {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  let currentHour = openHour;
  let currentMin = openMin;

  while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
    slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour++;
    }
  }

  return slots;
};

export default function Booking() {
  const { businessId } = useParams();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!businessId) {
        console.log("No businessId provided in URL");
        return;
      }

      console.log("Fetching business with ID:", businessId);

      try {
        const docRef = doc(db, "businesses", businessId);
        const docSnap = await getDoc(docRef);

        console.log("Document exists:", docSnap.exists());

        if (docSnap.exists()) {
          const businessData = { id: docSnap.id, ...docSnap.data() } as BusinessData;
          console.log("Business data fetched:", businessData);
          setBusiness(businessData);
        } else {
          console.error("No such business! ID:", businessId);
        }
      } catch (error) {
        console.error("Error fetching business:", error);
      }
    };
    fetchBusiness();
  }, [businessId]);

  const businessTypeInfo = business ? BUSINESS_TYPES.find(t => t.value === business.type) : null;
  const services = business?.services || [];
  const selectedServiceData = services.find((s) => s.id === selectedService);

  // Get available time slots for selected day
  const getTimeSlotsForDay = (date: Date): string[] => {
    if (!business?.hours) return [];
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = dayNames[date.getDay()];
    const dayHours = business.hours.find(h => h.day === dayName);

    if (!dayHours || !dayHours.isOpen) return [];
    return generateTimeSlots(dayHours.openTime, dayHours.closeTime);
  };

  const timeSlots = selectedDate ? getTimeSlotsForDay(selectedDate) : [];

  // Check if a day is closed
  const isDayClosed = (date: Date): boolean => {
    if (!business?.hours) return false;
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = dayNames[date.getDay()];
    const dayHours = business.hours.find(h => h.day === dayName);
    return !dayHours?.isOpen;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !business) return;

    setIsSubmitting(true);
    try {
      const appointmentData = {
        clientId: "guest", // or generate a client ID
        clientName: formData.name,
        phone: formData.phone,
        service: selectedServiceData?.name || "Unknown",
        serviceId: selectedService,
        time: selectedTime,
        date: format(selectedDate, "yyyy-MM-dd"),
        status: "pending",
        businessId: business.id || "default",
        price: selectedServiceData?.price || 0,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "appointments"), appointmentData);

      toast({
        title: "¡Turno agendado!",
        description: `Te esperamos el ${format(selectedDate, "PPP", { locale: es })} a las ${selectedTime}.`,
      });
      setStep("confirmation");
    } catch (error) {
      console.error("Error adding appointment: ", error);
      toast({
        title: "Error",
        description: "No se pudo agendar el turno. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case "welcome":
        return true;
      case "service":
        return selectedService !== null;
      case "datetime":
        return selectedDate !== undefined && selectedTime !== null;
      case "details":
        return formData.name.trim() !== "" && formData.phone.trim() !== "";
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step === "welcome") setStep("service");
    else if (step === "service") setStep("datetime");
    else if (step === "datetime") setStep("details");
    else if (step === "details") handleSubmit();
  };

  const prevStep = () => {
    if (step === "service") setStep("welcome");
    else if (step === "datetime") setStep("service");
    else if (step === "details") setStep("datetime");
  };

  const resetBooking = () => {
    setStep("welcome");
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setFormData({ name: "", phone: "" });
  };

  // If no business configured, show setup message
  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Negocio no configurado</h1>
          <p className="text-muted-foreground">
            Este enlace de reservas no está disponible. El negocio aún no ha completado su configuración.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{business.name} - Reserva tu turno</title>
        <meta name="description" content={`Reserva tu turno en ${business.name}. ${business.slogan || ''}`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${business.name} - Reserva tu turno`} />
        <meta property="og:description" content={`Reserva tu turno en ${business.name}. ${business.slogan || ''}`} />
        {business.logo && <meta property="og:image" content={business.logo} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${business.name} - Reserva tu turno`} />
        <meta name="twitter:description" content={`Reserva tu turno en ${business.name}. ${business.slogan || ''}`} />
        {business.logo && <meta name="twitter:image" content={business.logo} />}
      </Helmet>

      {/* Custom Header with Business Branding */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.name}
                className="w-10 h-10 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg">{businessTypeInfo?.icon || '📅'}</span>
              </div>
            )}
            <div>
              <h1 className="font-semibold text-foreground">{business.name}</h1>
              <p className="text-xs text-muted-foreground">Agendar turno</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        {/* Progress Steps - Hidden on welcome */}
        {step !== "welcome" && (
          <div className="flex items-center justify-center mb-8">
            {["service", "datetime", "details", "confirmation"].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    step === s || (step === "confirmation" && s !== "confirmation")
                      ? "bg-primary text-primary-foreground scale-110"
                      : ["service", "datetime", "details"].indexOf(step) > index - 1 && step !== "confirmation"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={cn(
                      "w-12 h-1 mx-1 transition-all duration-300",
                      ["service", "datetime", "details", "confirmation"].indexOf(step) > index
                        ? "bg-primary"
                        : "bg-secondary"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Welcome Step */}
        {step === "welcome" && (
          <div className="text-center space-y-8 animate-fade-in py-8">
            {/* Logo */}
            <div className="relative">
              {business.logo ? (
                <div className="relative w-28 h-28 mx-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="relative w-full h-full object-cover rounded-2xl border-2 border-primary/20 shadow-lg"
                  />
                </div>
              ) : (
                <div className="relative w-28 h-28 mx-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                    <span className="text-5xl">{businessTypeInfo?.icon || '📅'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Business Name & Slogan */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {business.name}
              </h1>
              {business.slogan && (
                <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {business.slogan}
                  <Sparkles className="w-4 h-4 text-primary" />
                </p>
              )}
            </div>

            {/* Business Type Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <span>{businessTypeInfo?.icon}</span>
              <span className="text-sm font-medium">{businessTypeInfo?.label}</span>
            </div>

            {/* Business Info */}
            {(business.address || business.phone) && (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                {business.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <Button
              size="lg"
              className="gap-2 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={nextStep}
            >
              <Calendar className="w-5 h-5" />
              Agendar turno
            </Button>
          </div>
        )}

        {/* Service Step */}
        {step === "service" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Selecciona un servicio
              </h2>
              <p className="text-muted-foreground">Elige el servicio que deseas agendar</p>
            </div>

            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all duration-200",
                    selectedService === service.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.duration} min</p>
                    </div>
                    <p className="font-semibold text-foreground">${service.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DateTime Step */}
        {step === "datetime" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Elige fecha y hora
              </h2>
              <p className="text-muted-foreground">
                {selectedServiceData?.name} - {selectedServiceData?.duration} min
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <Label className="text-sm text-muted-foreground mb-3 block">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    disabled={(date) => date < new Date() || isDayClosed(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedDate && (
              <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
                <Label className="text-sm text-muted-foreground mb-3 block">
                  Horarios disponibles
                </Label>
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                          selectedTime === time
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay horarios disponibles para este día
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Details Step */}
        {step === "details" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Tus datos
              </h2>
              <p className="text-muted-foreground">Ingresa tu información de contacto</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 9 11 1234-5678"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-medium text-foreground mb-3">Resumen del turno</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="text-foreground">{selectedServiceData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="text-foreground">
                    {selectedDate && format(selectedDate, "PPP", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="text-foreground">{selectedTime}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-medium text-foreground">Total:</span>
                  <span className="font-semibold text-foreground">${selectedServiceData?.price}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === "confirmation" && (
          <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                ¡Turno confirmado!
              </h2>
              <p className="text-muted-foreground">
                Te enviamos un recordatorio por WhatsApp
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 text-left max-w-sm mx-auto">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Negocio:</span>
                  <span className="text-foreground font-medium">{business.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="text-foreground font-medium">{selectedServiceData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="text-foreground font-medium">
                    {selectedDate && format(selectedDate, "PPP", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="text-foreground font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="text-foreground font-medium">{formData.name}</span>
                </div>
              </div>
            </div>

            <Button onClick={resetBooking} className="gap-2">
              Agendar otro turno
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step !== "confirmation" && step !== "welcome" && (
          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" onClick={prevStep} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button onClick={nextStep} disabled={!canProceed()}>
              {step === "details" ? "Confirmar turno" : "Continuar"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
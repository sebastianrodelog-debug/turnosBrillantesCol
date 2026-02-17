import { Bell, MessageCircle, Clock, CheckCircle, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings as NotificationSettingsType } from "@/types/business";

const defaultSettings: NotificationSettingsType = {
  whatsappReminder: true,
  reminderHours: 24,
  confirmationMessage: true,
  customMessage: "Hola {nombre}, te recordamos tu turno para {servicio} el día {fecha} a las {hora}. ¡Te esperamos!",
};

export function NotificationSettings() {
  const { business } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettingsType>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (business?.notifications) {
      setSettings({ ...defaultSettings, ...business.notifications });
    }
  }, [business]);

  const handleSave = async () => {
    if (!business?.id) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "businesses", business.id);
      await updateDoc(docRef, {
        notifications: settings
      });
      toast({
        title: "Configuración guardada",
        description: "Los cambios en las notificaciones se han guardado correctamente.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">Notificaciones</h2>
        <p className="text-muted-foreground">Configura las notificaciones por WhatsApp</p>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-xl p-6 border border-border animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-medium text-foreground">
                  Recordatorio por WhatsApp
                </Label>
                <Switch
                  checked={settings.whatsappReminder}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, whatsappReminder: checked })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Envía un recordatorio automático antes de cada turno
              </p>
              {settings.whatsappReminder && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Enviar</span>
                  <Input
                    type="number"
                    value={settings.reminderHours}
                    onChange={(e) =>
                      setSettings({ ...settings, reminderHours: parseInt(e.target.value) })
                    }
                    className="w-20"
                    min={1}
                    max={72}
                  />
                  <span className="text-sm text-muted-foreground">horas antes</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-medium text-foreground">
                  Confirmación de turno
                </Label>
                <Switch
                  checked={settings.confirmationMessage}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, confirmationMessage: checked })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Envía una confirmación cuando se agenda un nuevo turno
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <Label className="text-base font-medium text-foreground mb-4 block">
                Mensaje personalizado
              </Label>
              <Textarea
                value={settings.customMessage}
                onChange={(e) =>
                  setSettings({ ...settings, customMessage: e.target.value })
                }
                rows={4}
                className="mb-3"
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {"{nombre}"}, {"{servicio}"}, {"{fecha}"}, {"{hora}"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto gap-2">
        <Save className="w-4 h-4" />
        {isSaving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </div>
  );
}

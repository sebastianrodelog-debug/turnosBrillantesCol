import { Building, User, Globe, CreditCard, Upload, X, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/cloudinary";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function SettingsPanel() {
  const { business } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slogan: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        slogan: business.slogan || "",
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        logo: business.logo || "",
      });
    }
  }, [business]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setFormData({ ...formData, logo: imageUrl });
        toast({
          title: "Logo subido",
          description: "La imagen se ha cargado correctamente.",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error",
          description: "No se pudo subir la imagen.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!business?.id) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "businesses", business.id);
      await updateDoc(docRef, {
        name: formData.name,
        slogan: formData.slogan,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        logo: formData.logo,
      });
      toast({
        title: "Cambios guardados",
        description: "La información del negocio ha sido actualizada.",
      });
    } catch (error) {
      console.error("Error updating business:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">Configuración</h2>
        <p className="text-muted-foreground">Personaliza tu negocio</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-xl p-6 border border-border animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Información del negocio</h3>
          </div>

          {/* Logo Upload Section */}
          <div className="mb-6 flex flex-col items-center sm:items-start">
            <Label className="mb-2 block">Logo del negocio</Label>
            <div className="flex items-center gap-4">
              {formData.logo ? (
                <div className="relative w-24 h-24">
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-xl border border-border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                    onClick={() => setFormData({ ...formData, logo: "" })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Sube tu logo (JPG, PNG)</p>
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar imagen
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input
                id="businessName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="slogan">Slogan / Descripción corta</Label>
              <Input
                id="slogan"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Plan actual</h3>
              <p className="text-sm text-muted-foreground">Gratuito</p>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-foreground mb-2">
              <strong>Plan Gratuito incluye:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Hasta 50 turnos por mes</li>
              <li>• 1 usuario</li>
              <li>• Recordatorios básicos</li>
            </ul>
          </div>

          <Button variant="outline" className="w-full sm:w-auto">
            Actualizar a Premium
          </Button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving || isUploading} className="w-full sm:w-auto gap-2">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Guardar Cambios
          </>
        )}
      </Button>
    </div>
  );
}

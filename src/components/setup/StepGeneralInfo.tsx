import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BusinessData } from '@/types/business';
import { Building2, MapPin, Phone, Mail, Upload, X, Sparkles } from 'lucide-react';

interface StepGeneralInfoProps {
  data: Partial<BusinessData>;
  updateData: (data: Partial<BusinessData>) => void;
}

import { uploadImage } from '@/lib/cloudinary';
import { useToast } from '@/hooks/use-toast';

// ... existing imports

export function StepGeneralInfo({ data, updateData }: StepGeneralInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        updateData({ logo: imageUrl });
        toast({
          title: "Logo subido",
          description: "La imagen se ha cargado correctamente.",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error",
          description: "No se pudo subir la imagen. Intenta nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeLogo = () => {
    updateData({ logo: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          Logo del negocio
        </Label>

        {data.logo ? (
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={data.logo}
              alt="Logo preview"
              className="w-full h-full object-cover rounded-xl border-2 border-primary/20"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-6 h-6"
              onClick={removeLogo}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Subiendo...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arrastra tu logo aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG hasta 5MB
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-name" className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Nombre del negocio *
        </Label>
        <Input
          id="business-name"
          placeholder="Ej: Barbería El Clásico"
          value={data.name || ''}
          onChange={(e) => updateData({ name: e.target.value })}
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-slogan" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Slogan
        </Label>
        <Input
          id="business-slogan"
          placeholder="Ej: Tu estilo, nuestra pasión"
          value={data.slogan || ''}
          onChange={(e) => updateData({ slogan: e.target.value })}
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-address" className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Dirección
        </Label>
        <Textarea
          id="business-address"
          placeholder="Calle Principal 123, Ciudad"
          value={data.address || ''}
          onChange={(e) => updateData({ address: e.target.value })}
          className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business-phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Teléfono
          </Label>
          <Input
            id="business-phone"
            type="tel"
            placeholder="+1 234 567 8900"
            value={data.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email *
          </Label>
          <Input
            id="business-email"
            type="email"
            placeholder="contacto@tunegocio.com"
            value={data.email || ''}
            onChange={(e) => updateData({ email: e.target.value })}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        * Campos obligatorios
      </p>
    </div>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BusinessData, BusinessService } from '@/types/business';
import { Plus, Trash2, Clock, DollarSign, GripVertical } from 'lucide-react';

interface StepServicesProps {
  data: Partial<BusinessData>;
  updateData: (data: Partial<BusinessData>) => void;
}

export function StepServices({ data, updateData }: StepServicesProps) {
  const [newService, setNewService] = useState<Partial<BusinessService>>({
    name: '',
    duration: 30,
    price: 0,
  });

  const services = data.services || [];

  const addService = () => {
    if (!newService.name) return;
    
    const service: BusinessService = {
      id: crypto.randomUUID(),
      name: newService.name,
      duration: newService.duration || 30,
      price: newService.price || 0,
    };
    
    updateData({ services: [...services, service] });
    setNewService({ name: '', duration: 30, price: 0 });
  };

  const removeService = (id: string) => {
    updateData({ services: services.filter(s => s.id !== id) });
  };

  const updateService = (id: string, updates: Partial<BusinessService>) => {
    updateData({
      services: services.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  return (
    <div className="space-y-6">
      {/* Existing services */}
      <div className="space-y-3">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                value={service.name}
                onChange={(e) => updateService(service.id, { name: e.target.value })}
                placeholder="Nombre del servicio"
                className="bg-background"
              />
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={service.duration}
                  onChange={(e) => updateService(service.id, { duration: Number(e.target.value) })}
                  min={5}
                  step={5}
                  className="bg-background"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={service.price}
                  onChange={(e) => updateService(service.id, { price: Number(e.target.value) })}
                  min={0}
                  step={0.5}
                  className="bg-background"
                />
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeService(service.id)}
              className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new service */}
      <div className="border-2 border-dashed border-border rounded-lg p-4 space-y-4">
        <Label className="text-sm font-medium">Agregar nuevo servicio</Label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            value={newService.name}
            onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre del servicio"
          />
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={newService.duration}
              onChange={(e) => setNewService(prev => ({ ...prev, duration: Number(e.target.value) }))}
              min={5}
              step={5}
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService(prev => ({ ...prev, price: Number(e.target.value) }))}
              min={0}
              step={0.5}
            />
          </div>
        </div>
        
        <Button
          type="button"
          onClick={addService}
          disabled={!newService.name}
          className="w-full gap-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Agregar Servicio
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Puedes modificar estos servicios más adelante desde la configuración.
      </p>
    </div>
  );
}

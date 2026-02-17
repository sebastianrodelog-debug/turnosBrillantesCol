import { useState } from "react";
import { Plus, User, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { BusinessEmployee } from "@/types/business";
import { useToast } from "@/hooks/use-toast";

export function EmployeeManager() {
  const { business, saveBusiness } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<BusinessEmployee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    services: [] as string[],
  });

  const employees = business?.employees || [];
  const services = business?.services || [];

  const handleOpenDialog = (employee?: BusinessEmployee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        role: employee.role,
        services: employee.services,
      });
    } else {
      setEditingEmployee(null);
      setFormData({ name: "", role: "", services: [] });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    let updatedEmployees: BusinessEmployee[];
    
    if (editingEmployee) {
      updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData }
          : emp
      );
    } else {
      const newEmployee: BusinessEmployee = {
        id: crypto.randomUUID(),
        ...formData,
      };
      updatedEmployees = [...employees, newEmployee];
    }

    if (business) {
      saveBusiness({ ...business, employees: updatedEmployees });
    }

    toast({
      title: editingEmployee ? "Empleado actualizado" : "Empleado agregado",
      description: `${formData.name} ha sido ${editingEmployee ? 'actualizado' : 'agregado'} exitosamente.`,
    });

    setDialogOpen(false);
    setFormData({ name: "", role: "", services: [] });
    setEditingEmployee(null);
  };

  const handleDelete = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    if (business) {
      saveBusiness({ ...business, employees: updatedEmployees });
    }
    toast({
      title: "Empleado eliminado",
      description: "El empleado ha sido eliminado exitosamente.",
    });
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Empleados</h2>
          <p className="text-muted-foreground">Gestiona tu equipo de trabajo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar empleado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Editar empleado" : "Nuevo empleado"}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee 
                  ? "Modifica los datos del empleado" 
                  : "Agrega un nuevo miembro a tu equipo"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol / Especialidad</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Ej: Barbero senior, Estilista"
                />
              </div>

              <div className="space-y-2">
                <Label>Servicios que realiza</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center gap-2">
                      <Checkbox
                        id={service.id}
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <label 
                        htmlFor={service.id}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingEmployee ? "Guardar cambios" : "Agregar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Sin empleados</h3>
          <p className="text-muted-foreground mb-4">
            Agrega empleados para que tus clientes puedan elegir con quién agendar
          </p>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Agregar primer empleado
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <div 
              key={employee.id}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.role || "Sin rol asignado"}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(employee)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {employee.services.length > 0 ? (
                  <p>
                    {employee.services.length} servicio(s) asignado(s)
                  </p>
                ) : (
                  <p>Sin servicios asignados</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

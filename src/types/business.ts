export type BusinessType =
  | 'barbershop'
  | 'salon'
  | 'restaurant'
  | 'clinic'
  | 'spa'
  | 'gym'
  | 'other';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BusinessService {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface BusinessEmployee {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  services: string[]; // service IDs this employee can perform
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  service: string;
  serviceId: string;
  employeeId?: string;
  employeeName?: string;
  time: string;
  date: string;
  status: AppointmentStatus;
  notes?: string;
  price?: number;
  createdAt: string;
}

export interface BusinessData {
  id?: string;
  // Step 1: General info
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;

  // Step 2: Business type
  type: BusinessType;

  // Step 3: Services
  services: BusinessService[];

  // Step 4: Hours
  hours: BusinessHours[];

  // Employees (can be added later)
  employees: BusinessEmployee[];

  // Step 5: Notifications
  notifications?: NotificationSettings;
}

export interface NotificationSettings {
  whatsappReminder: boolean;
  reminderHours: number;
  confirmationMessage: boolean;
  customMessage: string;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'employee';
  businessId: string;
}

export const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string; description: string }[] = [
  { value: 'barbershop', label: 'Barbería', icon: '💈', description: 'Cortes de cabello y barba para caballeros' },
  { value: 'salon', label: 'Peluquería / Salón', icon: '💇', description: 'Estilismo y tratamientos capilares' },
  { value: 'restaurant', label: 'Restaurante', icon: '🍽️', description: 'Reservas de mesas y pedidos' },
  { value: 'clinic', label: 'Consultorio', icon: '🏥', description: 'Citas médicas y consultas' },
  { value: 'spa', label: 'Spa / Wellness', icon: '🧖', description: 'Tratamientos de relajación y belleza' },
  { value: 'gym', label: 'Gimnasio', icon: '🏋️', description: 'Clases y entrenamientos personales' },
  { value: 'other', label: 'Otro', icon: '📋', description: 'Personaliza según tu negocio' },
];

export const DEFAULT_SERVICES: Record<BusinessType, BusinessService[]> = {
  barbershop: [
    { id: '1', name: 'Corte de cabello', duration: 30, price: 15 },
    { id: '2', name: 'Afeitado clásico', duration: 20, price: 10 },
    { id: '3', name: 'Corte + Barba', duration: 45, price: 22 },
    { id: '4', name: 'Diseño de barba', duration: 25, price: 12 },
  ],
  salon: [
    { id: '1', name: 'Corte de dama', duration: 45, price: 25 },
    { id: '2', name: 'Tinte', duration: 90, price: 50 },
    { id: '3', name: 'Peinado', duration: 30, price: 20 },
    { id: '4', name: 'Tratamiento capilar', duration: 60, price: 35 },
  ],
  restaurant: [
    { id: '1', name: 'Mesa 2 personas', duration: 90, price: 0 },
    { id: '2', name: 'Mesa 4 personas', duration: 90, price: 0 },
    { id: '3', name: 'Mesa 6 personas', duration: 120, price: 0 },
    { id: '4', name: 'Reserva privada', duration: 180, price: 50 },
  ],
  clinic: [
    { id: '1', name: 'Consulta general', duration: 30, price: 40 },
    { id: '2', name: 'Consulta especializada', duration: 45, price: 60 },
    { id: '3', name: 'Revisión', duration: 20, price: 25 },
    { id: '4', name: 'Procedimiento menor', duration: 60, price: 80 },
  ],
  spa: [
    { id: '1', name: 'Masaje relajante', duration: 60, price: 45 },
    { id: '2', name: 'Facial', duration: 45, price: 35 },
    { id: '3', name: 'Manicure', duration: 30, price: 20 },
    { id: '4', name: 'Pedicure', duration: 45, price: 25 },
  ],
  gym: [
    { id: '1', name: 'Entrenamiento personal', duration: 60, price: 30 },
    { id: '2', name: 'Clase grupal', duration: 45, price: 10 },
    { id: '3', name: 'Evaluación física', duration: 30, price: 20 },
    { id: '4', name: 'Plan nutricional', duration: 45, price: 35 },
  ],
  other: [
    { id: '1', name: 'Servicio 1', duration: 30, price: 20 },
    { id: '2', name: 'Servicio 2', duration: 45, price: 30 },
  ],
};

export const DEFAULT_HOURS: BusinessHours[] = [
  { day: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Martes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Sábado', isOpen: true, openTime: '10:00', closeTime: '14:00' },
  { day: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '18:00' },
];

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BusinessData, BusinessHours } from '@/types/business';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepScheduleProps {
  data: Partial<BusinessData>;
  updateData: (data: Partial<BusinessData>) => void;
}

export function StepSchedule({ data, updateData }: StepScheduleProps) {
  const hours = data.hours || [];

  const updateHour = (day: string, updates: Partial<BusinessHours>) => {
    updateData({
      hours: hours.map(h => h.day === day ? { ...h, ...updates } : h),
    });
  };

  return (
    <div className="space-y-4">
      {hours.map((schedule, index) => (
        <div
          key={schedule.day}
          className={cn(
            'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg transition-all duration-300 animate-fade-in',
            schedule.isOpen 
              ? 'bg-primary/5 border border-primary/20' 
              : 'bg-muted/50 border border-transparent'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center justify-between sm:w-40">
            <Label className={cn(
              'font-medium transition-colors',
              schedule.isOpen ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {schedule.day}
            </Label>
            <Switch
              checked={schedule.isOpen}
              onCheckedChange={(checked) => updateHour(schedule.day, { isOpen: checked })}
            />
          </div>

          {schedule.isOpen && (
            <div className="flex items-center gap-3 flex-1 animate-fade-in">
              <Clock className="w-4 h-4 text-primary hidden sm:block" />
              
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={schedule.openTime}
                  onChange={(e) => updateHour(schedule.day, { openTime: e.target.value })}
                  className="w-full"
                />
                <span className="text-muted-foreground">a</span>
                <Input
                  type="time"
                  value={schedule.closeTime}
                  onChange={(e) => updateHour(schedule.day, { closeTime: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {!schedule.isOpen && (
            <span className="text-sm text-muted-foreground italic">
              Cerrado
            </span>
          )}
        </div>
      ))}

      <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
        <p className="text-sm text-accent-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Los clientes podrán agendar citas solo dentro de estos horarios.
        </p>
      </div>
    </div>
  );
}

import { BusinessData, BusinessType, BUSINESS_TYPES } from '@/types/business';
import { cn } from '@/lib/utils';

interface StepBusinessTypeProps {
  data: Partial<BusinessData>;
  updateData: (data: Partial<BusinessData>) => void;
}

export function StepBusinessType({ data, updateData }: StepBusinessTypeProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {BUSINESS_TYPES.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => updateData({ type: type.value })}
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-all duration-300 group hover:scale-[1.02]',
            data.type === type.value
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
              : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
              {type.icon}
            </span>
            <div>
              <h3 className={cn(
                'font-semibold transition-colors',
                data.type === type.value ? 'text-primary' : 'text-foreground'
              )}>
                {type.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {type.description}
              </p>
            </div>
          </div>
          
          {data.type === type.value && (
            <div className="mt-3 flex items-center gap-2 text-primary text-sm font-medium">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Seleccionado
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

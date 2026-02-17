import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BusinessData,
  BusinessType,
  BUSINESS_TYPES,
  DEFAULT_SERVICES,
  DEFAULT_HOURS
} from '@/types/business';
import { StepGeneralInfo } from '@/components/setup/StepGeneralInfo';
import { StepBusinessType } from '@/components/setup/StepBusinessType';
import { StepServices } from '@/components/setup/StepServices';
import { StepSchedule } from '@/components/setup/StepSchedule';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Información General', description: 'Datos de tu negocio' },
  { id: 2, title: 'Tipo de Negocio', description: 'Categoría y especialidad' },
  { id: 3, title: 'Servicios', description: 'Lo que ofreces' },
  { id: 4, title: 'Horarios', description: 'Cuándo atiendes' },
];

export default function BusinessSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<Partial<BusinessData>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    type: 'barbershop',
    services: [],
    hours: DEFAULT_HOURS,
  });

  const { employee, isAuthenticated, saveBusiness, business } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (business?.setupComplete) {
      // If business setup is already complete, redirect to dashboard
      navigate('/');
    }
  }, [isAuthenticated, business, navigate]);

  // Update services when business type changes
  useEffect(() => {
    if (businessData.type && currentStep < 3) {
      setBusinessData(prev => ({
        ...prev,
        services: DEFAULT_SERVICES[prev.type as BusinessType] || [],
      }));
    }
  }, [businessData.type]);

  const updateData = (data: Partial<BusinessData>) => {
    setBusinessData(prev => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete setup with setupComplete flag
      const completeBusinessData = {
        ...businessData,
        setupComplete: true
      } as BusinessData;

      await saveBusiness(completeBusinessData);
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return businessData.name && businessData.email;
      case 2:
        return !!businessData.type;
      case 3:
        return (businessData.services?.length ?? 0) > 0;
      case 4:
        return businessData.hours?.some(h => h.isOpen);
      default:
        return true;
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Configuración inicial
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configura tu negocio
          </h1>
          <p className="text-muted-foreground">
            Hola {employee?.name}, personaliza tu experiencia en solo 4 pasos
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center transition-all duration-300 ${step.id === currentStep
                  ? 'text-primary scale-105'
                  : step.id < currentStep
                    ? 'text-accent'
                    : 'text-muted-foreground'
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${step.id === currentStep
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : step.id < currentStep
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="p-6 backdrop-blur-sm bg-card/95 border-border/50 shadow-xl mb-6 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {STEPS[currentStep - 1].description}
            </p>
          </div>

          {currentStep === 1 && (
            <StepGeneralInfo data={businessData} updateData={updateData} />
          )}
          {currentStep === 2 && (
            <StepBusinessType data={businessData} updateData={updateData} />
          )}
          {currentStep === 3 && (
            <StepServices data={businessData} updateData={updateData} />
          )}
          {currentStep === 4 && (
            <StepSchedule data={businessData} updateData={updateData} />
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {currentStep === 4 ? (
              <>
                <Check className="w-4 h-4" />
                Finalizar
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

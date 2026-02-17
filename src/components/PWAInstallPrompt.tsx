import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Check if user has dismissed before
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slide-up">
            <div className="bg-card border border-border rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                            Instalar App
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Descarga Turnos Brillantes y accede más rápido desde tu pantalla de inicio
                        </p>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleInstall}
                                className="flex-1"
                            >
                                Instalar
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDismiss}
                            >
                                Ahora no
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8"
                        onClick={handleDismiss}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

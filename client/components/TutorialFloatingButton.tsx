"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  BookOpen, 
  HelpCircle, 
  RotateCcw, 
  Play,
  Settings
} from 'lucide-react';
import { useTutorial } from '@/contexts/TutorialContext';

interface TutorialFloatingButtonProps {
  className?: string;
}

export const TutorialFloatingButton: React.FC<TutorialFloatingButtonProps> = ({ 
  className = "" 
}) => {
  const { 
    startTutorial, 
    hasSeenTutorial, 
    resetTutorial,
    isOpen: tutorialIsOpen 
  } = useTutorial();
  const [isOpen, setIsOpen] = useState(false);

  // Configuración del tutorial principal
  const mainTutorialConfig = {
    id: 'main-dashboard-tutorial',
    title: 'Tutorial del Dashboard Principal',
    description: 'Aprende a navegar por los módulos principales del sistema R-M-P',
    showProgress: true,
    allowSkip: true,
    steps: [
      {
        id: 'vehiculos',
        selector: '#card-vehiculos',
        title: 'Gestión de Vehículos',
        description: 'Aquí puedes administrar toda tu flota de vehículos, registrar nuevos vehículos, ver su estado y asignar conductores.',
        position: 'bottom' as const,
      },
      {
        id: 'repartidores',
        selector: '#card-repartidores',
        title: 'Gestión de Repartidores',
        description: 'Gestiona a tus conductores y repartidores, asigna vehículos y controla sus horarios de trabajo.',
        position: 'bottom' as const,
      },
      {
        id: 'centro-distribucion',
        selector: '#card-centro-distribucion',
        title: 'Centro de Distribución',
        description: 'Administra tus centros de distribución y almacenes, visualiza el mapa de ubicaciones y gestiona inventarios.',
        position: 'bottom' as const,
      },
      {
        id: 'viajes',
        selector: '#card-viajes',
        title: 'Programación de Viajes',
        description: 'Planifica y programa viajes, asigna rutas a vehículos y realiza seguimiento en tiempo real.',
        position: 'bottom' as const,
      },
      {
        id: 'tesoreria',
        selector: '#card-tesoreria',
        title: 'Tesorería',
        description: 'Gestiona los ingresos y egresos de la empresa, controla facturación y pagos.',
        position: 'bottom' as const,
      },
      {
        id: 'resumen-rutas',
        selector: '#card-resumen-rutas',
        title: 'Resumen de Rutas',
        description: 'Visualiza reportes detallados de las rutas diarias, métricas de rendimiento y estadísticas de cumplimiento.',
        position: 'bottom' as const,
      },
      // Cumplimiento VH eliminado: paso previamente disponible en el tutorial
    ],
  };

  const handleStartTutorial = () => {
    startTutorial(mainTutorialConfig);
    setIsOpen(false);
  };

  const handleResetTutorial = () => {
    resetTutorial(mainTutorialConfig.id);
    setIsOpen(false);
  };

  const hasSeenMainTutorial = hasSeenTutorial(mainTutorialConfig.id);

  // No mostrar el botón si el tutorial está abierto
  if (tutorialIsOpen) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            size="lg"
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Tutorial</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-64 p-2"
          side="top"
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-blue-600">
            <HelpCircle className="w-4 h-4" />
            Centro de Ayuda
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleStartTutorial}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <div className="flex flex-col">
              <span className="font-medium">Iniciar Tutorial</span>
              <span className="text-xs text-gray-500">
                {hasSeenMainTutorial ? 'Ver nuevamente' : 'Primera vez'}
              </span>
            </div>
          </DropdownMenuItem>
          
          {hasSeenMainTutorial && (
            <DropdownMenuItem 
              onClick={handleResetTutorial}
              className="flex items-center gap-2 cursor-pointer text-orange-600 hover:text-orange-700"
            >
              <RotateCcw className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">Reiniciar Tutorial</span>
                <span className="text-xs text-gray-500">
                  Marcar como no visto
                </span>
              </div>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer text-gray-500"
            disabled
          >
            <Settings className="w-4 h-4" />
            <div className="flex flex-col">
              <span className="font-medium">Configuración</span>
              <span className="text-xs">Próximamente</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

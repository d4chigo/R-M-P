"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useTutorial, TutorialStep } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  SkipForward, 
  Play,
  CheckCircle2,
  Info
} from 'lucide-react';

interface TutorialTourProps {
  className?: string;
}

export const TutorialTour: React.FC<TutorialTourProps> = ({ className }) => {
  const {
    isOpen,
    currentTutorial,
    currentStep,
    nextStep,
    prevStep,
    closeTutorial,
    skipTutorial,
  } = useTutorial();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
  }>({ top: 0, left: 0, placement: 'bottom' });

  const overlayRef = useRef<HTMLDivElement>(null);

  // Buscar y posicionar el elemento objetivo
  useEffect(() => {
    if (!isOpen || !currentTutorial || currentStep >= currentTutorial.steps.length) {
      setTargetElement(null);
      setTargetRect(null);
      return;
    }

    const step = currentTutorial.steps[currentStep];
    const element = document.querySelector(step.selector) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      
      // Calcular posición del tooltip
      calculateTooltipPosition(rect, step.position || 'bottom');
      
      // Ejecutar acción si existe
      if (step.action) {
        step.action();
      }
    } else {
      setTargetElement(null);
      setTargetRect(null);
    }
  }, [isOpen, currentTutorial, currentStep]);

  // Aplicar efectos visuales al elemento objetivo
  useEffect(() => {
    if (!targetElement) return;

    const originalStyles = {
      boxShadow: targetElement.style.boxShadow,
      zIndex: targetElement.style.zIndex,
      position: targetElement.style.position,
      transition: targetElement.style.transition,
      transform: targetElement.style.transform,
    };

    // Aplicar highlight
    const isDark = document.documentElement.classList.contains('dark') || 
                   getComputedStyle(document.documentElement).getPropertyValue('color-scheme') === 'dark';
    
    targetElement.style.boxShadow = isDark 
      ? '0 0 0 3px rgba(99, 102, 241, 0.5), 0 8px 30px rgba(99, 102, 241, 0.3)'
      : '0 0 0 3px rgba(59, 130, 246, 0.5), 0 8px 30px rgba(59, 130, 246, 0.3)';
    targetElement.style.zIndex = '9999';
    targetElement.style.position = 'relative';
    targetElement.style.transition = 'all 0.3s ease';
    targetElement.style.transform = 'scale(1.02)';

    return () => {
      // Restaurar estilos originales
      Object.entries(originalStyles).forEach(([property, value]) => {
        (targetElement.style as any)[property] = value;
      });
    };
  }, [targetElement]);

  const calculateTooltipPosition = (rect: DOMRect, preferredPosition: string) => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const margin = 16;

    let position = preferredPosition;
    let top = 0;
    let left = 0;

    // Calcular posición basada en el espacio disponible
    const spaceTop = rect.top;
    const spaceBottom = viewport.height - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewport.width - rect.right;

    switch (preferredPosition) {
      case 'top':
        if (spaceTop < tooltipHeight + margin && spaceBottom > spaceTop) {
          position = 'bottom';
        }
        break;
      case 'bottom':
        if (spaceBottom < tooltipHeight + margin && spaceTop > spaceBottom) {
          position = 'top';
        }
        break;
      case 'left':
        if (spaceLeft < tooltipWidth + margin && spaceRight > spaceLeft) {
          position = 'right';
        }
        break;
      case 'right':
        if (spaceRight < tooltipWidth + margin && spaceLeft > spaceRight) {
          position = 'left';
        }
        break;
    }

    // Calcular coordenadas finales
    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - margin;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + margin;
        break;
    }

    // Ajustar para que no se salga del viewport
    left = Math.max(margin, Math.min(left, viewport.width - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, viewport.height - tooltipHeight - margin));

    setTooltipPosition({ top, left, placement: position as any });
  };

  if (!isOpen || !currentTutorial || !targetRect) {
    return null;
  }

  const currentStepData = currentTutorial.steps[currentStep];
  const progress = ((currentStep + 1) / currentTutorial.steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === currentTutorial.steps.length - 1;

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none" ref={overlayRef}>
      {/* Overlay con recorte */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        style={{
          clipPath: `polygon(
            0 0,
            0 100%,
            100% 100%,
            100% 0,
            0 0,
            ${targetRect.left}px ${targetRect.top}px,
            ${targetRect.right}px ${targetRect.top}px,
            ${targetRect.right}px ${targetRect.bottom}px,
            ${targetRect.left}px ${targetRect.bottom}px,
            ${targetRect.left}px ${targetRect.top}px
          )`,
        }}
        onClick={closeTutorial}
      />

      {/* Tooltip */}
      <div
        className="pointer-events-auto"
        style={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          zIndex: 10001,
        }}
      >
        <Card className="w-80 shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  {currentStepData.title}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeTutorial}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Barra de progreso */}
            {currentTutorial.showProgress !== false && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Paso {currentStep + 1} de {currentTutorial.steps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={isFirstStep}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                {currentTutorial.allowSkip !== false && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTutorial}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <SkipForward className="w-4 h-4" />
                    Omitir
                  </Button>
                )}
              </div>

              <Button
                onClick={nextStep}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TutorialStep {
  id: string;
  selector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

export interface TutorialConfig {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
}

interface TutorialContextType {
  isOpen: boolean;
  currentTutorial: TutorialConfig | null;
  currentStep: number;
  startTutorial: (config: TutorialConfig) => void;
  nextStep: () => void;
  prevStep: () => void;
  closeTutorial: () => void;
  skipTutorial: () => void;
  hasSeenTutorial: (tutorialId: string) => boolean;
  markTutorialAsSeen: (tutorialId: string) => void;
  resetTutorial: (tutorialId: string) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<TutorialConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Cargar tutoriales vistos desde localStorage
  const getSeenTutorials = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const seen = localStorage.getItem('rmp-seen-tutorials');
      return seen ? JSON.parse(seen) : [];
    } catch {
      return [];
    }
  };

  // Guardar tutorial visto en localStorage
  const saveSeenTutorial = (tutorialId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const seen = getSeenTutorials();
      if (!seen.includes(tutorialId)) {
        seen.push(tutorialId);
        localStorage.setItem('rmp-seen-tutorials', JSON.stringify(seen));
      }
    } catch (error) {
      console.error('Error saving seen tutorial:', error);
    }
  };

  // Remover tutorial de la lista de vistos
  const removeSeenTutorial = (tutorialId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const seen = getSeenTutorials();
      const updated = seen.filter(id => id !== tutorialId);
      localStorage.setItem('rmp-seen-tutorials', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing seen tutorial:', error);
    }
  };

  const startTutorial = (config: TutorialConfig) => {
    setCurrentTutorial(config);
    setCurrentStep(0);
    setIsOpen(true);
  };

  const nextStep = () => {
    if (!currentTutorial) return;
    
    const nextStepIndex = currentStep + 1;
    
    if (nextStepIndex >= currentTutorial.steps.length) {
      // Tutorial completado
      closeTutorial();
      if (currentTutorial.id) {
        saveSeenTutorial(currentTutorial.id);
      }
    } else {
      setCurrentStep(nextStepIndex);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const closeTutorial = () => {
    setIsOpen(false);
    setCurrentTutorial(null);
    setCurrentStep(0);
  };

  const skipTutorial = () => {
    if (currentTutorial?.id) {
      saveSeenTutorial(currentTutorial.id);
    }
    closeTutorial();
  };

  const hasSeenTutorial = (tutorialId: string): boolean => {
    return getSeenTutorials().includes(tutorialId);
  };

  const markTutorialAsSeen = (tutorialId: string) => {
    saveSeenTutorial(tutorialId);
  };

  const resetTutorial = (tutorialId: string) => {
    removeSeenTutorial(tutorialId);
  };

  const value: TutorialContextType = {
    isOpen,
    currentTutorial,
    currentStep,
    startTutorial,
    nextStep,
    prevStep,
    closeTutorial,
    skipTutorial,
    hasSeenTutorial,
    markTutorialAsSeen,
    resetTutorial,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

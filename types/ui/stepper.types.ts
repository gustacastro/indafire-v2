import { ReactNode } from 'react';

export interface StepItem {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  canAccessStep: (stepId: number) => boolean;
}
